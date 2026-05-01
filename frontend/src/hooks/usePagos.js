import { useState } from 'react';
import { paymentApi } from '../services/api';
import toast from 'react-hot-toast';

export const usePagos = () => {
  const [loading, setLoading] = useState(false);
  const [pagoActivo, setPagoActivo] = useState(null);

  const crearPago = async (idVisita, pagoData) => {
    setLoading(true);
    try {
      const response = await paymentApi.post(`/nuevo/${idVisita}`, pagoData);
      toast.success('Pago registrado exitosamente');
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const buscarPago = async (id) => {
    setLoading(true);
    try {
      const response = await paymentApi.get(`/ver/${id}`);
      setPagoActivo(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
      setPagoActivo(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const actualizarPago = async (id, pagoData) => {
    setLoading(true);
    try {
      const response = await paymentApi.put(`/alterar/${id}`, pagoData);
      toast.success('Pago actualizado exitosamente');
      setPagoActivo(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    pagoActivo,
    loading,
    crearPago,
    buscarPago,
    actualizarPago
  };
};
