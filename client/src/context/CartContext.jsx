import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'cart';

// The same product in a different size/color is a separate line
const lineKey = (item) => `${item.productId}|${item.size}|${item.color}`;

function cartReducer(items, action) {
  switch (action.type) {
    case 'add': {
      const key = lineKey(action.item);
      const existing = items.find((i) => i.key === key);
      if (existing) {
        return items.map((i) => (i.key === key ? { ...i, quantity: Math.min(10, i.quantity + action.item.quantity) } : i));
      }
      return [...items, { ...action.item, key }];
    }
    case 'setQuantity':
      return items.map((i) => (i.key === action.key ? { ...i, quantity: Math.max(1, Math.min(10, action.quantity)) } : i));
    case 'remove':
      return items.filter((i) => i.key !== action.key);
    case 'clear':
      return [];
    default:
      return items;
  }
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadCart);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable — cart just won't persist */
    }
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      isOpen,
      openCart: () => setOpen(true),
      closeCart: () => setOpen(false),
      addItem: (item) => {
        dispatch({ type: 'add', item });
        setOpen(true);
      },
      setQuantity: (key, quantity) => dispatch({ type: 'setQuantity', key, quantity }),
      removeItem: (key) => dispatch({ type: 'remove', key }),
      clearCart: () => dispatch({ type: 'clear' }),
    }),
    [items, isOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
