import { useState, useCallback } from 'react';
import { scheduleApi, clientesApi, tecnicosApi } from '../services/api';
import toast from 'react-hot-toast';

export const useAgendamiento = () => {
  const [citas, setCitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTodasCitas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await scheduleApi.get('');
      setCitas(res.data || []);
    } catch {
      setCitas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCitasByCliente = useCallback(async (clienteAgendaId) => {
    setLoading(true);
    try {
      const res = await scheduleApi.get(`/cliente/${clienteAgendaId}`);
      setCitas(res.data || []);
    } catch {
      setCitas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveClienteAgendaId = useCallback(async (user) => {
    const email = user.email || `${user.username}@techfix.cl`;
    try {
      const res = await clientesApi.get(`/by-email/${encodeURIComponent(email)}`);
      return res.data?.id || null;
    } catch {
      return null;
    }
  }, []);

  const fetchCitasByTecnico = useCallback(async (tecnicoId) => {
    setLoading(true);
    try {
      const res = await scheduleApi.get(`/tecnico/${tecnicoId}`);
      setCitas(res.data || []);
    } catch {
      setCitas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTecnicos = useCallback(async () => {
    try {
      const res = await tecnicosApi.get('/activos');
      setTecnicos(res.data || []);
    } catch {
      setTecnicos([]);
    }
  }, []);

  const fetchClientes = useCallback(async () => {
    try {
      const res = await clientesApi.get('');
      setClientes(res.data || []);
    } catch {
      setClientes([]);
    }
  }, []);

  const crearCita = async (datos) => {
    setLoading(true);
    try {
      let clienteId = datos.clienteAgendaId;
      if (!clienteId) {
        const clienteRes = await clientesApi.post('', {
          nombre: datos.nombre,
          apellido: datos.apellido || '',
          email: datos.email || `${datos.nombre.toLowerCase().replace(/\s+/g, '.')}@techfix.cl`,
          telefono: datos.telefono,
        });
        clienteId = clienteRes.data.id;
      }

      const res = await scheduleApi.post('', {
        fechaHora: datos.fechaHora,
        tipoServicio: datos.tipoServicio || 'REPARACION',
        descripcion: datos.descripcion,
        comuna: datos.comuna,
        clienteId,
      });

      toast.success('Cita agendada exitosamente');
      return { ...res.data, clienteAgendaId: clienteId };
    } catch (error) {
      console.error('Error creando cita:', error);
      toast.error('No se pudo agendar la cita');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    setLoading(true);
    try {
      const res = await scheduleApi.patch(`/${id}/estado`, { estado: nuevoEstado });
      toast.success('Estado actualizado');
      return res.data;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  const eliminarCita = async (id) => {
    setLoading(true);
    try {
      await scheduleApi.delete(`/${id}`);
      toast.success('Cita cancelada');
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const gestionarServicio = async (id, datos) => {
    setLoading(true);
    try {
      const res = await scheduleApi.patch(`/${id}/gestionar`, datos);
      toast.success(datos.accion === 'CANCELAR' ? 'Servicio cancelado' : 'Servicio gestionado correctamente');
      return res.data;
    } catch (error) {
      const msg = error?.response?.data?.message || 'No se pudo gestionar el servicio';
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelarCitaCliente = async (id, motivo) => {
    setLoading(true);
    try {
      const res = await scheduleApi.patch(`/${id}/cancelar-cliente`, { motivo });
      toast.success('Servicio cancelado exitosamente');
      return res.data;
    } catch (error) {
      const msg = error?.response?.data?.message || 'No se pudo cancelar el servicio';
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchResumenPorComuna = useCallback(async () => {
    try {
      const res = await scheduleApi.get('/resumen-por-comuna');
      return res.data || [];
    } catch {
      return [];
    }
  }, []);

  return {
    citas,
    clientes,
    tecnicos,
    loading,
    fetchTodasCitas,
    fetchCitasByCliente,
    fetchCitasByTecnico,
    fetchTecnicos,
    fetchClientes,
    resolveClienteAgendaId,
    crearCita,
    actualizarEstado,
    eliminarCita,
    gestionarServicio,
    cancelarCitaCliente,
    fetchResumenPorComuna,
  };
};
