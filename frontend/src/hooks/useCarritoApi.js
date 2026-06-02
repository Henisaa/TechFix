import { useState } from 'react';
import { paymentApi } from '../services/api';
import toast from 'react-hot-toast';


export const useCarritoApi = () => {
  const [loading, setLoading] = useState(false);
  const [ordenActiva, setOrdenActiva] = useState(null);

  
  const confirmarOrden = async ({ clienteId, metodoPago, referenciaExterna, items }) => {
    if (loading) return null;
    setLoading(true);
    try {
      const payload = {
        clienteId,
        metodoPago,
        referenciaExterna: referenciaExterna || '',
        items,
      };

      const response = await paymentApi.post('/carrito/nuevo', payload);
      const orden = response.data;
      setOrdenActiva(orden);
      toast.success('¡Compra realizada exitosamente! 🎉');
      return orden;
    } catch (error) {
      console.error('Error al confirmar orden de carrito:', error);
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  
  const verOrden = async (id) => {
    setLoading(true);
    try {
      const response = await paymentApi.get(`/carrito/${id}`);
      setOrdenActiva(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al consultar orden:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  
  const verOrdenesPorCliente = async (clienteId) => {
    setLoading(true);
    try {
      const response = await paymentApi.get(`/carrito/cliente/${clienteId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error al consultar órdenes del cliente:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchTodasOrdenes = async () => {
    setLoading(true);
    try {
      const response = await paymentApi.get('/carrito/todas');
      return response.data || [];
    } catch {
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    ordenActiva,
    confirmarOrden,
    verOrden,
    verOrdenesPorCliente,
    fetchTodasOrdenes,
  };
};
