import { createContext, useContext, useState } from 'react';
import { userApi } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem('techfix_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.token && parsed?.user) {
          return { token: parsed.token, user: parsed.user };
        }
      }
    } catch {
    }
    localStorage.removeItem('techfix_user');
    return { token: null, user: null };
  });

  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await userApi.post('/login', { username, password });
      const { token, ...userData } = res.data;
      localStorage.setItem('techfix_user', JSON.stringify({ token, user: userData }));
      setState({ token, user: userData });
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
      await userApi.post('/register', data);
      toast.success('Cuenta creada. Inicia sesión para continuar.');
      return true;
    } catch (error) {
      toast.error('No se pudo crear la cuenta');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setState({ token: null, user: null });
    localStorage.removeItem('techfix_user');
    toast.success('Sesión cerrada');
  };

  return (
    <AuthContext.Provider value={{ user: state.user, token: state.token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
