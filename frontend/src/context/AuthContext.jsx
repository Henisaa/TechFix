import { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('techfix_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await userApi.post('/login', { username, password });
      const userData = res.data;
      setUser(userData);
      localStorage.setItem('techfix_user', JSON.stringify(userData));
      toast.success(`Bienvenido, ${userData.fullName || userData.username}`);
      return userData;
    } catch (error) {
      toast.error('Credenciales incorrectas');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const res = await userApi.post('/register', data);
      const userData = res.data;
      setUser(userData);
      localStorage.setItem('techfix_user', JSON.stringify(userData));
      toast.success('Cuenta creada exitosamente');
      return userData;
    } catch (error) {
      toast.error('No se pudo crear la cuenta');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('techfix_user');
    toast.success('Sesión cerrada');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
