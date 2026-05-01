import { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('techfix_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await userApi.get(`/username/${username}`);
      const userData = response.data;

      if (!userData || !userData.active) {
        throw new Error("Usuario no encontrado o inactivo");
      }

      if (userData.password !== password) {
        throw new Error("Credenciales inválidas");
      }

      const loggedUser = {
        id: userData.id,
        username: userData.username,
        role: userData.role,
        active: userData.active,
        fullName: userData.fullName
      };

      setUser(loggedUser);
      localStorage.setItem('techfix_user', JSON.stringify(loggedUser));
      return loggedUser;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('techfix_user');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
