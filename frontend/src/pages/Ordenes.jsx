import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgendamiento } from '../hooks/useAgendamiento';
import { useCarritoApi } from '../hooks/useCarritoApi';
import { useAuth } from '../context/AuthContext';
import { scheduleApi } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiActivity, FiRefreshCw, FiSearch, FiCheckCircle, FiDollarSign,
  FiTool, FiXCircle, FiDownload, FiHash, FiShoppingBag, FiPackage,
  FiCreditCard,
} from 'react-icons/fi';
import * as XLSX from 'xlsx';

const ESTADO_COLORS = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  CONFIRMADA: 'bg-blue-100 text-blue-800',
  EN_PROCESO: 'bg-orange-100 text-orange-800',
  COMPLETADA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800',
};

const ESTADOS = ['PENDIENTE', 'CONFIRMADA', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA'];

const TimelineStep = ({ label, active, isCurrent }) => (
  <div className="flex flex-col items-center">
    <div
      className={`h-8 w-8 rounded-full flex items-center justify-center border-4 z-10 ${
        active
          ? 'bg-primary border-primary text-white'
          : isCurrent
          ? 'bg-white border-primary text-primary shadow-[0_0_0_4px_rgba(30,64,175,0.2)]'
          : 'bg-white border-slate-300 text-slate-300'
      }`}
    >
      {active && <span className="text-sm">✓</span>}
    </div>
    <span
      className={`mt-3 text-xs font-medium text-center ${
        active || isCurrent ? 'text-slate-900' : 'text-slate-400'
      }`}
    >
      {label}
    </span>
  </div>
);

const formatPrice = (price) => {
  if (!price) return null;
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
};

const METODOS_CITA = [
  { value: 'EFECTIVO',        label: '💵 Efectivo' },
  { value: 'TARJETA_DEBITO',  label: '💳 Tarjeta de Débito' },
  { value: 'TARJETA_CREDITO', label: '💳 Tarjeta de Crédito' },
];

const Ordenes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { citas, loading, fetchTodasCitas, fetchCitasByCliente, actualizarEstado, gestionarServicio, resolveClienteAgendaId, cancelarCitaCliente } = useAgendamiento();
  const { verOrdenesPorCliente, fetchTodasOrdenes } = useCarritoApi();

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('ALL');
  const [activeTab, setActiveTab] = useState('servicios');
  const [ordenesCarrito, setOrdenesCarrito] = useState([]);
  const [loadingCarrito, setLoadingCarrito] = useState(false);

  const [gestionModal, setGestionModal] = useState(null);
  const [gestionForm, setGestionForm] = useState({ precio: '', descripcionRealizado: '', metodoPago: 'EFECTIVO' });
  const [confirmCancelar, setConfirmCancelar] = useState(false);
  const [loadingEfectivo, setLoadingEfectivo] = useState(false);
  const [cancelarClienteModal, setCancelarClienteModal] = useState(null);
  const [cancelarClienteForm, setCancelarClienteForm] = useState({ motivo: '' });
  const [detalleModal, setDetalleModal] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'ADMIN' || user.role === 'TECNICO') {
      fetchTodasCitas();
      setLoadingCarrito(true);
      fetchTodasOrdenes().then(data => { setOrdenesCarrito(data || []); setLoadingCarrito(false); });
    } else {
      resolveClienteAgendaId(user).then(id => {
        if (id) fetchCitasByCliente(id);
      });
      setLoadingCarrito(true);
      verOrdenesPorCliente(user.id).then(data => { setOrdenesCarrito(data || []); setLoadingCarrito(false); });
    }
  }, [user, fetchTodasCitas, fetchCitasByCliente]);

  const handleEstado = async (id, nuevoEstado) => {
    const result = await actualizarEstado(id, nuevoEstado);
    if (result) {
      if (user.role === 'ADMIN' || user.role === 'TECNICO') fetchTodasCitas();
      else resolveClienteAgendaId(user).then(agendaId => { if (agendaId) fetchCitasByCliente(agendaId); });
    }
  };

  const openGestion = (cita) => {
    setGestionModal(cita);
    setGestionForm({
      precio: cita.precioCotizado || '',
      descripcionRealizado: cita.descripcionRealizado || '',
      metodoPago: cita.metodoPago || 'EFECTIVO',
    });
    setConfirmCancelar(false);
  };

  const handleGestionar = async (accion) => {
    if (!gestionModal) return;
    if (accion === 'COMPLETAR' && (!gestionForm.precio || parseFloat(gestionForm.precio) <= 0)) return;
    const datos = {
      precio: accion === 'COMPLETAR' ? parseFloat(gestionForm.precio) : 0,
      descripcionRealizado: gestionForm.descripcionRealizado,
      metodoPago: gestionForm.metodoPago,
      accion,
    };
    const result = await gestionarServicio(gestionModal.id, datos);
    if (result) {
      setGestionModal(null);
      if (user.role === 'ADMIN' || user.role === 'TECNICO') fetchTodasCitas();
      else resolveClienteAgendaId(user).then(agendaId => { if (agendaId) fetchCitasByCliente(agendaId); });
    }
  };

  const handleConfirmarEfectivo = async (citaId) => {
    setLoadingEfectivo(true);
    try {
      await scheduleApi.patch(`/${citaId}/marcar-pagado`);
      toast.success('✅ Pago en efectivo confirmado');
      if (user.role === 'ADMIN' || user.role === 'TECNICO') fetchTodasCitas();
      else resolveClienteAgendaId(user).then(agendaId => { if (agendaId) fetchCitasByCliente(agendaId); });
    } catch {
      toast.error('No se pudo confirmar el pago');
    } finally {
      setLoadingEfectivo(false);
    }
  };

  const handleCancelarCliente = async (e) => {
    e.preventDefault();
    if (!cancelarClienteModal || !cancelarClienteForm.motivo.trim()) return;
    const result = await cancelarCitaCliente(cancelarClienteModal.id, cancelarClienteForm.motivo.trim());
    if (result) {
      setCancelarClienteModal(null);
      setCancelarClienteForm({ motivo: '' });
      if (user.role === 'ADMIN' || user.role === 'TECNICO') fetchTodasCitas();
      else resolveClienteAgendaId(user).then(agendaId => { if (agendaId) fetchCitasByCliente(agendaId); });
    }
  };

  const exportarExcel = () => {
    const filas = citasFiltradas.map(c => ({
      'N° Orden': c.numeroOrden || '—',
      'ID Ticket': c.id,
      'Cliente': c.nombre || (c.cliente ? `${c.cliente.nombre} ${c.cliente.apellido || ''}`.trim() : `#${c.clienteId}`),
      'Tipo Servicio': c.tipoEquipo || c.tipoServicio || '—',
      'Descripción Problema': c.descripcionProblema || c.descripcion || '—',
      'Trabajo Realizado': c.descripcionRealizado || '—',
      'Técnico': c.tecnico ? `${c.tecnico.nombre} ${c.tecnico.apellido || ''}`.trim() : '—',
      'Fecha': c.fechaSolicitada || c.fecha || (c.fechaHora ? c.fechaHora.slice(0, 10) : '—'),
      'Estado': c.estado || '—',
      'Estado Pago': c.estadoPagoTicket || '—',
      'Método Pago': c.metodoPago || '—',
      'Monto (CLP)': c.precioCotizado ? Number(c.precioCotizado) : null,
    }));

    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();

    const cols = [8, 10, 20, 20, 35, 35, 20, 12, 12, 16, 16, 14];
    ws['!cols'] = cols.map(w => ({ wch: w }));

    XLSX.utils.book_append_sheet(wb, ws, 'Servicios Técnicos');

    const totalesPorEstado = {};
    filas.forEach(f => {
      if (!totalesPorEstado[f['Estado']]) totalesPorEstado[f['Estado']] = { cantidad: 0, monto: 0 };
      totalesPorEstado[f['Estado']].cantidad++;
      if (f['Monto (CLP)']) totalesPorEstado[f['Estado']].monto += f['Monto (CLP)'];
    });

    const resumenFilas = Object.entries(totalesPorEstado).map(([estado, d]) => ({
      'Estado': estado,
      'Cantidad': d.cantidad,
      'Monto Total (CLP)': d.monto,
    }));
    resumenFilas.push({
      'Estado': 'TOTAL',
      'Cantidad': filas.length,
      'Monto Total (CLP)': filas.reduce((s, f) => s + (f['Monto (CLP)'] || 0), 0),
    });

    const wsResumen = XLSX.utils.json_to_sheet(resumenFilas);
    wsResumen['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    XLSX.writeFile(wb, `TechFix_Balance_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('📊 Excel generado correctamente');
  };

  const citasFiltradas = citas.filter((c) => {
    const matchEstado = filtroEstado === 'ALL' || c.estado === filtroEstado;
    const matchBusqueda =
      !busqueda ||
      String(c.id).includes(busqueda) ||
      c.numeroOrden?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.tipoEquipo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.tipoServicio?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.nombre?.toLowerCase().includes(busqueda.toLowerCase());
    return matchEstado && matchBusqueda;
  });

  const isStaff = user?.role === 'ADMIN' || user?.role === 'TECNICO';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <FiActivity className="text-primary" />
            {isStaff ? 'Gestión de Órdenes' : 'Mis Órdenes de Servicio'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isStaff
              ? 'Revisa y gestiona todas las solicitudes de servicio'
              : 'Revisa el estado de tus solicitudes de reparación'}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {isAdmin && (
            <button
              onClick={exportarExcel}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-all shadow-md"
            >
              <FiDownload /> Exportar Excel
            </button>
          )}
          <button
            onClick={() => {
              if (isStaff) fetchTodasCitas();
              else resolveClienteAgendaId(user).then(id => { if (id) fetchCitasByCliente(id); });
            }}
            className="text-slate-500 hover:text-primary transition-colors"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ID, N° orden, equipo o nombre..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary text-sm"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="ALL">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      <div className="flex border-b border-slate-200 mb-6 gap-1">
        <button
          onClick={() => setActiveTab('servicios')}
          className={`px-5 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'servicios' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FiTool className="text-sm" /> Servicios Técnicos
        </button>
        <button
          onClick={() => setActiveTab('compras')}
          className={`px-5 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'compras' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FiShoppingBag className="text-sm" /> {isStaff ? 'Compras de Clientes' : 'Mis Compras'} ({ordenesCarrito.length})
        </button>
      </div>
      {!isStaff && citasFiltradas.length > 0 && activeTab === 'servicios' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-8 text-center">
            Estado de tu Solicitud más Reciente — #{citasFiltradas[0].id}
          </h2>
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="h-1 w-full bg-slate-200 rounded-full"></div>
            </div>
            <div className="relative flex justify-between">
              {['PENDIENTE', 'CONFIRMADA', 'EN_PROCESO', 'COMPLETADA'].map((estado) => {
                const ORDEN = ['PENDIENTE', 'CONFIRMADA', 'EN_PROCESO', 'COMPLETADA'];
                const idx = ORDEN.indexOf(citasFiltradas[0].estado);
                const myIdx = ORDEN.indexOf(estado);
                return (
                  <TimelineStep
                    key={estado}
                    label={estado.replace('_', ' ')}
                    active={myIdx < idx}
                    isCurrent={myIdx === idx}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compras' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loadingCarrito ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <FiRefreshCw className="animate-spin mr-3 text-xl" /> Cargando compras...
            </div>
          ) : ordenesCarrito.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🛒</div>
              <p className="text-slate-500">Aún no hay compras registradas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID Orden</th>
                    {isStaff && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Productos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Método</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {ordenesCarrito.map((orden) => (
                    <tr key={orden.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-primary font-mono">#{orden.id}</span>
                      </td>
                      {isStaff && (
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {orden.clienteUsername || `ID: ${orden.clienteId}`}
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {orden.createdAt ? new Date(orden.createdAt).toLocaleString('es-CL') : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {(orden.items || []).map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <FiPackage className="text-slate-400 flex-shrink-0" />
                              <span className="text-slate-700 font-medium">{item.nombreProducto}</span>
                              <span className="text-slate-400">×{item.cantidad}</span>
                              <span className="text-slate-500">
                                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(item.precioUnitario)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{orden.metodoPago || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">
                          {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(orden.montoTotal || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          orden.estadoOrden === 'PAGADO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {orden.estadoOrden || 'PENDIENTE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <FiRefreshCw className="animate-spin mr-3 text-xl" /> Cargando órdenes...
            </div>
          ) : citasFiltradas.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-slate-500">No hay órdenes para mostrar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">N° Orden</th>
                  {isStaff && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Servicio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Precio / Pago</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {citasFiltradas.map((cita) => {
                  const esCancelada = cita.estado === 'CANCELADA';
                  const esCompletada = cita.estado === 'COMPLETADA';
                  const puedeGestionar = isStaff && !esCancelada && !esCompletada;
                  const esEfectivoPendiente = isStaff && cita.estadoPagoTicket === 'PENDIENTE_PAGO' && cita.metodoPago === 'EFECTIVO';

                  return (
                    <tr
                      key={cita.id}
                      onClick={(e) => {
                        if (e.target.closest('button') || e.target.closest('select') || e.target.closest('option')) return;
                        setDetalleModal(cita);
                      }}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <FiHash className="text-slate-400 text-xs" />
                          <span className="text-sm font-mono font-semibold text-slate-700">
                            {cita.numeroOrden || `#${cita.id}`}
                          </span>
                        </div>
                      </td>
                      {isStaff && (
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {cita.nombre || (cita.cliente ? `${cita.cliente.nombre} ${cita.cliente.apellido || ''}`.trim() : `Cliente #${cita.clienteId}`)}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{cita.tipoEquipo || cita.tipoServicio}</div>
                        <div className="text-xs text-slate-400 max-w-xs truncate">{cita.descripcionProblema || cita.descripcion}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {cita.fechaSolicitada || cita.fecha || (cita.fechaHora ? cita.fechaHora.slice(0, 10) : '—')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[cita.estado] || 'bg-slate-100 text-slate-700'}`}>
                          {cita.estado || 'PENDIENTE'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {cita.estadoPagoTicket === 'PAGADO' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                            <FiCheckCircle className="text-xs" /> Pagado
                          </span>
                        ) : cita.estadoPagoTicket === 'CANCELADO' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                            <FiXCircle className="text-xs" /> Cancelado
                          </span>
                        ) : cita.estadoPagoTicket === 'PENDIENTE_PAGO' && !isStaff ? (
                          cita.metodoPago === 'EFECTIVO' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                              <FiDollarSign className="text-xs" />
                              {formatPrice(cita.precioCotizado)} — Pagar en efectivo
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1.5 items-start">
                              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200">
                                <FiDollarSign className="text-xs" />
                                Pendiente de pago {cita.precioCotizado ? formatPrice(cita.precioCotizado) : ''}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/pago-ticket/${cita.id}`); }}
                                className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer"
                              >
                                <FiCreditCard className="text-xs" /> Pagar en línea
                              </button>
                            </div>
                          )
                        ) : cita.estadoPagoTicket === 'PENDIENTE_PAGO' && isStaff ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                            <FiDollarSign className="text-xs" /> {formatPrice(cita.precioCotizado)} — Pendiente
                          </span>
                        ) : cita.precioCotizado ? (
                          <span className="text-sm text-slate-600">{formatPrice(cita.precioCotizado)}</span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 items-center flex-wrap">
                          {isStaff && esEfectivoPendiente && (
                            <button
                              disabled={loadingEfectivo}
                              onClick={(e) => { e.stopPropagation(); handleConfirmarEfectivo(cita.id); }}
                              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                            >
                              <FiCheckCircle className="text-xs" /> Confirmar efectivo
                            </button>
                          )}
                          {isStaff && puedeGestionar && (
                            <button
                              onClick={(e) => { e.stopPropagation(); openGestion(cita); }}
                              className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                            >
                              <FiTool className="text-xs" /> Gestionar
                            </button>
                          )}
                          {isStaff && esCompletada && (cita.estadoPagoTicket === 'SIN_PRECIO' || !cita.estadoPagoTicket) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); openGestion(cita); }}
                              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                            >
                              <FiDollarSign className="text-xs" /> Asignar Precio
                            </button>
                          )}
                          {isStaff && !esCancelada && !esCompletada && cita.estadoPagoTicket !== 'PENDIENTE_PAGO' && (
                            <select
                              className="text-sm border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary bg-white"
                              value={cita.estado || 'PENDIENTE'}
                              onChange={(e) => { e.stopPropagation(); handleEstado(cita.id, e.target.value); }}
                            >
                              {ESTADOS.map((e) => (
                                <option key={e} value={e}>{e}</option>
                              ))}
                            </select>
                          )}
                          {!isStaff && !esCancelada && !esCompletada && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setCancelarClienteModal(cita); }}
                              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer"
                            >
                              <FiXCircle className="text-xs" /> Cancelar Orden
                            </button>
                          )}
                          {isStaff && (esCancelada || (esCompletada && cita.estadoPagoTicket !== 'SIN_PRECIO' && cita.estadoPagoTicket)) && !esEfectivoPendiente && (
                            <span className="text-xs text-slate-400 italic">Sin acciones</span>
                          )}
                          {!isStaff && (esCancelada || esCompletada) && (
                            <span className="text-xs text-slate-400 italic">Sin acciones</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}

      {gestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FiTool className="text-orange-500" /> Gestionar Servicio
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <FiHash className="text-slate-400 text-xs" />
                  <span className="text-sm font-mono text-slate-600 font-semibold">
                    {gestionModal.numeroOrden || `#${gestionModal.id}`}
                  </span>
                  <span className="text-xs text-slate-400">— {gestionModal.tipoEquipo || gestionModal.tipoServicio}</span>
                </div>
              </div>
              <button onClick={() => setGestionModal(null)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">×</button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Precio del Servicio (CLP) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej: 25000"
                    className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={gestionForm.precio}
                    onChange={(e) => setGestionForm({ ...gestionForm, precio: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción del Trabajo Realizado *</label>
                <textarea
                  rows={3}
                  placeholder="Ej: Se realizó formateo completo del computador, instalación de Windows 11 y drivers."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
                  value={gestionForm.descripcionRealizado}
                  onChange={(e) => setGestionForm({ ...gestionForm, descripcionRealizado: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Método de Pago del Cliente</label>
                <select
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={gestionForm.metodoPago}
                  onChange={(e) => setGestionForm({ ...gestionForm, metodoPago: e.target.value })}
                >
                  {METODOS_CITA.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                {gestionForm.metodoPago !== 'EFECTIVO' && (
                  <p className="text-xs text-blue-600 mt-1.5">
                    💳 El cliente recibirá un botón para pagar online con tarjeta.
                  </p>
                )}
                {gestionForm.metodoPago === 'EFECTIVO' && (
                  <p className="text-xs text-amber-600 mt-1.5">
                    💵 El cliente paga en efectivo. Deberás confirmar el cobro manualmente.
                  </p>
                )}
              </div>

              {confirmCancelar ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-red-700 mb-3">¿Confirmar cancelación del servicio?</p>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Razón de cancelación</label>
                    <textarea
                      rows={2}
                      placeholder="Describe el motivo..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-red-300"
                      value={gestionForm.descripcionRealizado}
                      onChange={(e) => setGestionForm({ ...gestionForm, descripcionRealizado: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmCancelar(false)}
                      className="flex-1 px-4 py-2 text-slate-600 font-medium border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                    >
                      Volver
                    </button>
                    <button
                      disabled={!gestionForm.descripcionRealizado.trim()}
                      onClick={() => handleGestionar('CANCELAR')}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      <FiXCircle /> Confirmar Cancelación
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setConfirmCancelar(true)}
                    className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
                  >
                    <FiXCircle /> Cancelar Servicio
                  </button>
                  <button
                    disabled={!gestionForm.precio || parseFloat(gestionForm.precio) <= 0 || !gestionForm.descripcionRealizado.trim() || loading}
                    onClick={() => handleGestionar('COMPLETAR')}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md"
                  >
                    <FiCheckCircle /> Marcar como Realizado
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {cancelarClienteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FiXCircle className="text-red-600" /> Cancelar Orden de Servicio
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Orden {cancelarClienteModal.numeroOrden || `#${cancelarClienteModal.id}`}</p>
              </div>
              <button onClick={() => { setCancelarClienteModal(null); setCancelarClienteForm({ motivo: '' }); }} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">×</button>
            </div>
            <form onSubmit={handleCancelarCliente} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Motivo de Cancelación *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Por favor, escribe el motivo de la cancelación de tu orden..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none"
                  value={cancelarClienteForm.motivo}
                  onChange={(e) => setCancelarClienteForm({ motivo: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setCancelarClienteModal(null); setCancelarClienteForm({ motivo: '' }); }}
                  className="flex-1 px-4 py-2.5 text-slate-600 font-medium border border-slate-300 rounded-xl text-sm hover:bg-slate-50 transition-colors"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={!cancelarClienteForm.motivo.trim() || loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md"
                >
                  <FiXCircle /> Confirmar Cancelación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detalleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FiTool className="text-primary" /> Detalle de la Orden
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Orden {detalleModal.numeroOrden || `#${detalleModal.id}`}</p>
              </div>
              <button onClick={() => setDetalleModal(null)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">×</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-700">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-slate-400 text-xs uppercase font-semibold">Cliente</p>
                  <p className="font-semibold text-slate-800">{detalleModal.nombre || (detalleModal.cliente ? `${detalleModal.cliente.nombre} ${detalleModal.cliente.apellido || ''}`.trim() : `Cliente #${detalleModal.clienteId}`)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase font-semibold">Técnico Asignado</p>
                  <p className="font-semibold text-slate-800">{detalleModal.tecnico ? `${detalleModal.tecnico.nombre} ${detalleModal.tecnico.apellido || ''}`.trim() : 'Sin asignar'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase font-semibold">Fecha Solicitada</p>
                  <p className="font-medium">{detalleModal.fechaSolicitada || detalleModal.fecha || (detalleModal.fechaHora ? detalleModal.fechaHora.slice(0, 10) : '—')}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase font-semibold">Estado de la Orden</p>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${ESTADO_COLORS[detalleModal.estado] || 'bg-slate-100 text-slate-700'}`}>
                    {detalleModal.estado || 'PENDIENTE'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Servicio y Descripción</p>
                <p className="font-semibold text-slate-800">{detalleModal.tipoEquipo || detalleModal.tipoServicio}</p>
                <p className="mt-1 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{detalleModal.descripcionProblema || detalleModal.descripcion || 'Sin descripción de problema'}</p>
              </div>
              {detalleModal.precioCotizado && (
                <div className="pb-4 border-b border-slate-100">
                  <p className="text-slate-400 text-xs uppercase font-semibold">Detalle de Pago</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-semibold text-slate-800">
                      Monto Cotizado: {formatPrice(detalleModal.precioCotizado)}
                    </span>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      detalleModal.estadoPagoTicket === 'PAGADO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {detalleModal.estadoPagoTicket === 'PAGADO' ? 'PAGADO' : 'PENDIENTE DE PAGO'}
                    </span>
                  </div>
                  {detalleModal.metodoPago && (
                    <p className="text-xs text-slate-500 mt-1">Método: {detalleModal.metodoPago === 'EFECTIVO' ? '💵 Efectivo' : '💳 Tarjeta'}</p>
                  )}
                </div>
              )}
              {detalleModal.estado === 'CANCELADA' && detalleModal.descripcionRealizado && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl">
                  <p className="font-bold text-xs uppercase text-red-700 flex items-center gap-1.5 mb-1">
                    <FiXCircle /> Motivo de Cancelación
                  </p>
                  <p className="font-medium">{detalleModal.descripcionRealizado}</p>
                </div>
              )}
              {detalleModal.estado === 'COMPLETADA' && detalleModal.descripcionRealizado && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl">
                  <p className="font-bold text-xs uppercase text-green-700 flex items-center gap-1.5 mb-1">
                    <FiCheckCircle /> Trabajo Realizado
                  </p>
                  <p className="font-medium">{detalleModal.descripcionRealizado}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setDetalleModal(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ordenes;
