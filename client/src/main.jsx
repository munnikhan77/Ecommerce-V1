import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// global styles first, so component CSS modules can override them
import './styles/global.css';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
