import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAgendamiento } from '../hooks/useAgendamiento';
import { scheduleApi } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiTool, FiCheckCircle, FiAlertTriangle, FiCreditCard,
  FiArrowLeft, FiUser, FiCalendar, FiDollarSign, FiInfo,
} from 'react-icons/fi';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price ?? 0);

const formatDateTime = (dt) => {
  if (!dt) return '—';
  try {
    return new Date(dt).toLocaleString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dt;
  }
};

const METODOS_PAGO = [
  { value: 'EFECTIVO',        label: '💵 Efectivo' },
  { value: 'TARJETA_DEBITO',  label: '💳 Tarjeta de Débito' },
  { value: 'TARJETA_CREDITO', label: '💳 Tarjeta de Crédito' },
  { value: 'TRANSFERENCIA',   label: '🏦 Transferencia' },
];

const getReferenciaInfo = (metodo) => {
  switch (metodo) {
    case 'TRANSFERENCIA':
      return { label: 'Número de operación bancaria', placeholder: 'Ej: 123456789', required: true };
    case 'TARJETA_DEBITO':
    case 'TARJETA_CREDITO':
      return { label: 'Código de autorización', placeholder: 'Ej: AUTH-78421', required: true };
    default:
      return { label: 'Número de recibo (opcional)', placeholder: 'Se genera automáticamente si se deja vacío', required: false };
  }
};

const ESTADO_COLORES = {
  PENDIENTE:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  EN_PROCESO:  'bg-orange-100 text-orange-800 border-orange-200',
  COMPLETADA:  'bg-green-100 text-green-800 border-green-200',
  CANCELADA:   'bg-red-100 text-red-800 border-red-200',
};

const PagoTicket = () => {
  const { citaId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cita, setCita] = useState(null);
  const [loadingCita, setLoadingCita] = useState(true);
  const [loadingPago, setLoadingPago] = useState(false);
  const [pagado, setPagado] = useState(false);

  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [referenciaExterna, setReferenciaExterna] = useState('');

  const referenciaInfo = getReferenciaInfo(metodoPago);

  // Carga la cita por ID
  useEffect(() => {
    const cargarCita = async () => {
      setLoadingCita(true);
      try {
        const res = await scheduleApi.get(`/${citaId}`);
        setCita(res.data);
        if (res.data?.estadoPagoTicket === 'PAGADO') {
          setPagado(true);
        }
      } catch (error) {
        toast.error('No se encontró el ticket de servicio');
        navigate('/ordenes');
      } finally {
        setLoadingCita(false);
      }
    };
    if (citaId) cargarCita();
  }, [citaId]);

  useEffect(() => {
    setReferenciaExterna('');
  }, [metodoPago]);

  const handlePagar = async (e) => {
    e.preventDefault();
    if (!cita || loadingPago) return;

    setLoadingPago(true);
    try {
      // 1. Marcar el ticket como pagado en la agenda
      const res = await scheduleApi.patch(`/${citaId}/marcar-pagado`);
      setCita(res.data);
      setPagado(true);
      toast.success('✅ Servicio técnico pagado exitosamente');
    } catch (error) {
      console.error('Error al pagar el ticket:', error);
      toast.error('No se pudo procesar el pago. Inténtalo de nuevo.');
    } finally {
      setLoadingPago(false);
    }
  };

  // Loading
  if (loadingCita) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>Cargando ticket de servicio...</p>
        </div>
      </div>
    );
  }

  if (!cita) return null;

  const estadoPagoTicket = cita.estadoPagoTicket;
  const tienePrecio = cita.precioCotizado && Number(cita.precioCotizado) > 0;
  const esPendientePago = estadoPagoTicket === 'PENDIENTE_PAGO';

  // Pantalla de pago exitoso
  if (pagado || estadoPagoTicket === 'PAGADO') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-green-200 p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-green-600 text-4xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">¡Servicio Pagado!</h1>
          <p className="text-slate-500 mb-6">El servicio técnico ha sido pagado exitosamente.</p>
          <div className="bg-slate-50 rounded-xl p-4 text-left mb-6">
            <p className="text-sm text-slate-500">Ticket #</p>
            <p className="text-2xl font-bold text-primary">#{cita.id}</p>
            <p className="text-sm text-slate-500 mt-2">Monto pagado</p>
            <p className="text-xl font-bold text-slate-900">{formatPrice(cita.precioCotizado)}</p>
            <p className="text-sm text-slate-500 mt-2">Tipo de servicio</p>
            <p className="text-base font-medium text-slate-700">{cita.tipoServicio}</p>
            {cita.tecnico && (
              <>
                <p className="text-sm text-slate-500 mt-2">Técnico</p>
                <p className="text-base font-medium text-slate-700">
                  {cita.tecnico.nombre} {cita.tecnico.apellido || ''}
                </p>
              </>
            )}
          </div>
          <Link
            to="/ordenes"
            className="block bg-primary hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Ver mis órdenes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">

      {/* Volver */}
      <Link to="/ordenes" className="flex items-center gap-2 text-slate-500 hover:text-primary text-sm mb-6 transition-colors">
        <FiArrowLeft /> Volver a mis órdenes
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <FiTool className="text-primary" /> Pago de Servicio Técnico
        </h1>
        <p className="text-slate-500 mt-1">Ticket #{cita.id}</p>
      </div>

      {/* Detalle del ticket */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-5 pb-4 border-b border-slate-100">
          📋 Detalle del Servicio
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 flex items-center gap-1.5 mb-0.5"><FiInfo className="text-xs" /> Ticket ID</p>
            <p className="font-bold text-slate-900 text-lg">#{cita.id}</p>
          </div>
          <div>
            <p className="text-slate-500 flex items-center gap-1.5 mb-0.5"><FiTool className="text-xs" /> Tipo de Servicio</p>
            <p className="font-semibold text-slate-800">{cita.tipoServicio}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500 mb-0.5">Descripción del problema</p>
            <p className="text-slate-800">{cita.descripcion || '—'}</p>
          </div>
          <div>
            <p className="text-slate-500 flex items-center gap-1.5 mb-0.5"><FiCalendar className="text-xs" /> Fecha y Hora</p>
            <p className="font-medium text-slate-800">{formatDateTime(cita.fechaHora)}</p>
          </div>
          {cita.tecnico && (
            <div>
              <p className="text-slate-500 flex items-center gap-1.5 mb-0.5"><FiUser className="text-xs" /> Técnico Asignado</p>
              <p className="font-medium text-slate-800">
                {cita.tecnico.nombre} {cita.tecnico.apellido || ''}
              </p>
            </div>
          )}
          <div>
            <p className="text-slate-500 mb-0.5">Estado del servicio</p>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${
              ESTADO_COLORES[cita.estado] || 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {cita.estado}
            </span>
          </div>
          <div>
            <p className="text-slate-500 mb-0.5">Estado de pago</p>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${
              estadoPagoTicket === 'PAGADO'
                ? 'bg-green-100 text-green-800 border-green-200'
                : estadoPagoTicket === 'PENDIENTE_PAGO'
                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {estadoPagoTicket || 'SIN PRECIO ASIGNADO'}
            </span>
          </div>
        </div>

        {/* Precio destacado */}
        {tienePrecio && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-slate-500 text-sm flex items-center gap-1.5 mb-1">
              <FiDollarSign className="text-xs" /> Monto a pagar
            </p>
            <p className="text-4xl font-extrabold text-slate-900">{formatPrice(cita.precioCotizado)}</p>
          </div>
        )}
      </div>

      {/* Sin precio asignado */}
      {!tienePrecio && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-xl mb-6">
          <FiAlertTriangle className="text-xl flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">El técnico aún no ha asignado el precio</p>
            <p className="text-sm mt-1">El pago estará disponible una vez que el técnico finalice el servicio y asigne un valor.</p>
          </div>
        </div>
      )}

      {/* Formulario de pago */}
      {esPendientePago && tienePrecio && (
        <form onSubmit={handlePagar} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <FiCreditCard className="text-primary" /> Datos de Pago
          </h2>

          {/* Método de pago */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Método de Pago</label>
            <div className="relative">
              <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                className="w-full px-4 py-3 pl-9 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
              >
                {METODOS_PAGO.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Referencia */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {referenciaInfo.label}
              {referenciaInfo.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              required={referenciaInfo.required}
              placeholder={referenciaInfo.placeholder}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              value={referenciaExterna}
              onChange={(e) => setReferenciaExterna(e.target.value)}
            />
          </div>

          {/* Resumen */}
          <div className="bg-slate-50 rounded-xl p-4 mb-5 flex justify-between items-center">
            <span className="text-slate-600 font-medium">Total a pagar</span>
            <span className="text-2xl font-extrabold text-primary">{formatPrice(cita.precioCotizado)}</span>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loadingPago}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all ${
              loadingPago
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
            }`}
          >
            {loadingPago ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Procesando...
              </>
            ) : (
              <>
                <FiCheckCircle className="text-lg" /> Pagar {formatPrice(cita.precioCotizado)}
              </>
            )}
          </button>
        </form>
      )}

    </div>
  );
};

export default PagoTicket;
