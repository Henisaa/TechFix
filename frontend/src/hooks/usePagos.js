import { useState, useRef, useCallback } from 'react';
import { paymentApi } from '../services/api';
import toast from 'react-hot-toast';


export const usePagos = () => {
  const [pagoActivo, setPagoActivo] = useState(null);
  const [loading, setLoading] = useState(false);

  
  
  const idempotencyKey = useRef(crypto.randomUUID());

  
  const renewKey = useCallback(() => {
    idempotencyKey.current = crypto.randomUUID();
  }, []);

  
  const crearPago = async (idVisitaTecnica, pagoData) => {
    if (loading) return null; 

    setLoading(true);
    try {
      const response = await paymentApi.post(`/nuevo/${idVisitaTecnica}`, pagoData, {
        headers: {
          'Idempotency-Key': idempotencyKey.current,
        },
      });

      const pago = response.data;

      
      if (response.status === 200) {
        toast('⚠️ Pago duplicado detectado — se retorna el pago original', {
          icon: '🔁',
          style: { background: '#fef3c7', color: '#92400e' },
        });
      } else {
        
        toast.success('Pago registrado exitosamente');
        renewKey();
      }

      setPagoActivo(pago);
      return pago;
    } catch (error) {
      console.error('Error al crear pago:', error);
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
      console.error('Error al buscar pago:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  
  const actualizarPago = async (id, pagoData) => {
    setLoading(true);
    try {
      const response = await paymentApi.put(`/alterar/${id}`, pagoData);
      toast.success('Pago actualizado correctamente');
      setPagoActivo(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar pago:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    pagoActivo,
    loading,
    
    currentKey: idempotencyKey.current,
    crearPago,
    buscarPago,
    actualizarPago,
  };
};
