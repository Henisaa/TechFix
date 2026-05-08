import { useState, useCallback } from 'react';
import { userApi } from '../services/api';
import toast from 'react-hot-toast';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userApi.get('');
      setUsuarios(res.data || []);
    } catch {
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUsuario = async (data) => {
    setLoading(true);
    try {
      const res = await userApi.post('/register', data);
      toast.success('Usuario creado');
      await fetchUsuarios();
      return res.data;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateUsuario = async (id, data) => {
    setLoading(true);
    try {
      const res = await userApi.put(`/${id}`, data);
      toast.success('Usuario actualizado');
      await fetchUsuarios();
      return res.data;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteUsuario = async (id) => {
    setLoading(true);
    try {
      await userApi.delete(`/${id}`);
      toast.success('Usuario eliminado');
      await fetchUsuarios();
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { usuarios, loading, fetchUsuarios, createUsuario, updateUsuario, deleteUsuario };
};
