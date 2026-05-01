import { useState, useCallback } from 'react';
import { userApi } from '../services/api';
import toast from 'react-hot-toast';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userApi.get('');
      setUsuarios(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByRole = async (role) => {
    setLoading(true);
    try {
      const response = await userApi.get(`/role/${role}`);
      setUsuarios(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createUsuario = async (userData) => {
    try {
      await userApi.post('', userData);
      toast.success('Usuario creado exitosamente');
      fetchUsuarios();
      return true;
    } catch (error) {
      return false;
    }
  };

  const updateUsuario = async (id, userData) => {
    try {
      await userApi.put(`/${id}`, userData);
      toast.success('Usuario actualizado exitosamente');
      fetchUsuarios();
      return true;
    } catch (error) {
      return false;
    }
  };

  const toggleStatus = async (id) => {
    try {
      await userApi.patch(`/${id}/toggle-status`);
      toast.success('Estado actualizado');
      fetchUsuarios();
    } catch (error) {
      console.error(error);
    }
  };

  const assignRole = async (id, role) => {
    try {
      await userApi.patch(`/${id}/assign-role?role=${role}`);
      toast.success('Rol actualizado');
      fetchUsuarios();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteUsuario = async (id) => {
    try {
      await userApi.delete(`/${id}`);
      toast.success('Usuario eliminado');
      fetchUsuarios();
    } catch (error) {
      console.error(error);
    }
  };

  return {
    usuarios,
    loading,
    fetchUsuarios,
    fetchByRole,
    createUsuario,
    updateUsuario,
    toggleStatus,
    assignRole,
    deleteUsuario
  };
};
