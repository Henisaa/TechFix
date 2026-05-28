import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgendamiento } from '../hooks/useAgendamiento';
import { useAuth } from '../context/AuthContext';
import { FiActivity, FiRefreshCw, FiSearch, FiCheckCircle, FiDollarSign, FiTool, FiXCircle, FiDownload } from 'react-icons/fi';
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

const METODOS_PAGO = [
  { value: 'EFECTIVO',        label: 'Efectivo' },
  { value: 'TARJETA_DEBITO',  label: 'Tarjeta de Débito' },
  { value: 'TARJETA_CREDITO', label: 'Tarjeta de Crédito' },
  { value: 'TRANSFERENCIA',   label: 'Transferencia' },
];

const Ordenes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { citas, loading, fetchTodasCitas, fetchCitasByCliente, actualizarEstado, gestionarServicio } = useAgendamiento();

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('ALL');

  const [gestionModal, setGestionModal] = useState(null);
  const [gestionForm, setGestionForm] = useState({ precio: '', descripcionRealizado: '', metodoPago: 'EFECTIVO' });
  const [confirmCancelar, setConfirmCancelar] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'ADMIN' || user.role === 'TECNICO') {
      fetchTodasCitas();
    } else {
      fetchCitasByCliente(user.id);
    }
  }, [user, fetchTodasCitas, fetchCitasByCliente]);

  const handleEstado = async (id, nuevoEstado) => {
    const result = await actualizarEstado(id, nuevoEstado);
    if (result) {
      if (user.role === 'ADMIN' || user.role === 'TECNICO') fetchTodasCitas();
      else fetchCitasByCliente(user.id);
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
      else fetchCitasByCliente(user.id);
    }
  };

  const exportarExcel = () => {
    const rows = citasFiltradas
      .filter(c => c.estado !== 'CANCELADA')
      .map(c => ({
        'ID': c.id,
        'Cliente': c.nombre || `Cliente #${c.clienteId}`,
        'Equipo': c.tipoEquipo || c.tipoServicio,
        'Descripción Problema': c.descripcionProblema || c.descripcion || '—',
        'Descripción Realizado': c.descripcionRealizado || '—',
        'Técnico': c.tecnico ? `${c.tecnico.nombre} ${c.tecnico.apellido || ''}`.trim() : '—',
        'Fecha': c.fechaSolicitada || c.fecha || c.fechaHora || '—',
        'Estado': c.estado,
        'Estado Pago': c.estadoPagoTicket || '—',
        'Método Pago': c.metodoPago || '—',
        'Monto': c.precioCotizado ? Number(c.precioCotizado) : null,
      }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Órdenes');
    XLSX.writeFile(wb, `TechFix_Ordenes_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const citasFiltradas = citas.filter((c) => {
    const matchEstado = filtroEstado === 'ALL' || c.estado === filtroEstado;
    const matchBusqueda =
      !busqueda ||
      String(c.id).includes(busqueda) ||
      c.tipoEquipo?.toLowerCase().includes(busqueda.toLowerCase()) ||
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
              disabled={citasFiltradas.filter(c => c.estado !== 'CANCELADA').length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold px-4 py-2 rounded-lg text-sm transition-all shadow-md"
            >
              <FiDownload /> Exportar Excel
            </button>
          )}
          <button
            onClick={() => {
              if (isStaff) fetchTodasCitas();
              else fetchCitasByCliente(user.id);
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
            placeholder="Buscar por ID, equipo o nombre..."
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

      {!isStaff && citasFiltradas.length > 0 && (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                  {isStaff && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Equipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Precio / Pago</th>
                  {isStaff && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {citasFiltradas.map((cita) => {
                  const esCancelada = cita.estado === 'CANCELADA';
                  const esCompletada = cita.estado === 'COMPLETADA';
                  const puedeGestionar = isStaff && !esCancelada && !esCompletada;

                  return (
                    <tr key={cita.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">#{cita.id}</td>
                      {isStaff && (
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {cita.nombre || `Cliente #${cita.clienteId}`}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{cita.tipoEquipo || cita.tipoServicio}</div>
                        <div className="text-xs text-slate-400 max-w-xs truncate">{cita.descripcionProblema || cita.descripcion}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{cita.fechaSolicitada || cita.fecha || cita.fechaHora?.slice(0, 10) || '—'}</td>
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
                              {formatPrice(cita.precioCotizado)} — Pago en efectivo
                            </span>
                          ) : (
                            <button
                              onClick={() => navigate(`/pago-ticket/${cita.id}`)}
                              className="inline-flex items-center gap-1.5 bg-primary hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm hover:shadow-md"
                            >
                              <FiDollarSign className="text-xs" />
                              Pagar {cita.precioCotizado ? formatPrice(cita.precioCotizado) : ''}
                            </button>
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
                      {isStaff && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 items-center">
                            {puedeGestionar && (
                              <button
                                onClick={() => openGestion(cita)}
                                className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                              >
                                <FiTool className="text-xs" /> Gestionar
                              </button>
                            )}
                            {!esCancelada && !esCompletada && (
                              <select
                                className="text-sm border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary bg-white"
                                value={cita.estado || 'PENDIENTE'}
                                onChange={(e) => handleEstado(cita.id, e.target.value)}
                              >
                                {ESTADOS.map((e) => (
                                  <option key={e} value={e}>{e}</option>
                                ))}
                              </select>
                            )}
                            {(esCancelada || esCompletada) && (
                              <span className="text-xs text-slate-400 italic">Sin acciones</span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {gestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FiTool className="text-orange-500" /> Gestionar Servicio #{gestionModal.id}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">{gestionModal.tipoEquipo || gestionModal.tipoServicio}</p>
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
                  placeholder="Ej: Se realizó formateo completo del computador del cliente, instalación de Windows 11 y drivers."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
                  value={gestionForm.descripcionRealizado}
                  onChange={(e) => setGestionForm({ ...gestionForm, descripcionRealizado: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Método de Pago</label>
                <select
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={gestionForm.metodoPago}
                  onChange={(e) => setGestionForm({ ...gestionForm, metodoPago: e.target.value })}
                >
                  {METODOS_PAGO.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                {gestionForm.metodoPago !== 'EFECTIVO' && (
                  <p className="text-xs text-blue-600 mt-1.5">
                    💳 El cliente recibirá un enlace para pagar online con tarjeta.
                  </p>
                )}
                {gestionForm.metodoPago === 'EFECTIVO' && (
                  <p className="text-xs text-amber-600 mt-1.5">
                    💵 El cliente debe pagar en efectivo al técnico. Tú debes confirmar el cobro en el sistema.
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
    </div>
  );
};

export default Ordenes;
