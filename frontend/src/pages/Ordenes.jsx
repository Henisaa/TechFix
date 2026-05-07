import { useState, useEffect } from 'react';
import { useAgendamiento } from '../hooks/useAgendamiento';
import { useAuth } from '../context/AuthContext';
import { FiActivity, FiRefreshCw, FiSearch, FiCheckCircle } from 'react-icons/fi';

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

const Ordenes = () => {
  const { user } = useAuth();
  const { citas, loading, fetchTodasCitas, fetchCitasByCliente, actualizarEstado } = useAgendamiento();

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('ALL');

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

      {}
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

      {}
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

      {}
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
                  {isStaff && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Cambiar Estado</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {citasFiltradas.map((cita) => (
                  <tr key={cita.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">#{cita.id}</td>
                    {isStaff && (
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {cita.nombre || `Cliente #${cita.clienteId}`}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{cita.tipoEquipo}</div>
                      <div className="text-xs text-slate-400 max-w-xs truncate">{cita.descripcionProblema}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{cita.fechaSolicitada || cita.fecha || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[cita.estado] || 'bg-slate-100 text-slate-700'}`}>
                        {cita.estado || 'PENDIENTE'}
                      </span>
                    </td>
                    {isStaff && (
                      <td className="px-6 py-4 text-right">
                        <select
                          className="text-sm border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary bg-white"
                          value={cita.estado || 'PENDIENTE'}
                          onChange={(e) => handleEstado(cita.id, e.target.value)}
                        >
                          {ESTADOS.map((e) => (
                            <option key={e} value={e}>{e}</option>
                          ))}
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ordenes;
