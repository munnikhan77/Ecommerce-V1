import { createContext, useContext, useState } from 'react';
import { api, tokenStore } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => Boolean(tokenStore.get()));

  const login = async (password) => {
    const { token } = await api.login(password);
    tokenStore.set(token);
    setIsAdmin(true);
  };

  const logout = () => {
    tokenStore.clear();
    setIsAdmin(false);
  };

  return <AuthContext.Provider value={{ isAdmin, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
