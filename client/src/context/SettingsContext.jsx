import { createContext, useContext, useEffect } from 'react';
import { api } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { formatPrice } from '../utils/format';

const SettingsContext = createContext(null);

/** Store-wide settings (name, shipping, hero slides…) loaded once from the API */
export function SettingsProvider({ children }) {
  const { data: settings, loading, reload } = useFetch(() => api.getSettings(), []);
  const { data: categories, reload: reloadCategories } = useFetch(() => api.getCategories(), []);

  useEffect(() => {
    if (settings?.storeName) document.title = `${settings.storeName} — ${settings.tagline}`;
  }, [settings]);

  const value = {
    settings,
    categories: categories ?? [],
    loading,
    reload,
    reloadCategories,
    price: (amount) => formatPrice(amount, settings?.currency),
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
