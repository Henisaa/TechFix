import { useState, useEffect } from 'react';
import { useAgendamiento } from '../hooks/useAgendamiento';
import { useAuth } from '../context/AuthContext';
import {
  FiCalendar, FiClock, FiPlus, FiRefreshCw, FiCheckCircle, FiXCircle, FiTool,
} from 'react-icons/fi';

const TIPO_SERVICIO = ['REPARACION', 'INSTALACION'];

const ESTADO_COLORS = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  EN_PROCESO: 'bg-orange-100 text-orange-800',
  COMPLETADA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800',
};

const Agendamiento = () => {
  const { user } = useAuth();
  const {
    citas,
    tecnicos,
    loading,
    fetchTodasCitas,
    fetchCitasByCliente,
    fetchCitasByTecnico,
    fetchTecnicos,
    crearCita,
    actualizarEstado,
    eliminarCita,
  } = useAgendamiento();

  const [activeTab, setActiveTab] = useState('mis-citas');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    tipoServicio: 'REPARACION',
    descripcion: '',
    fecha: '',
    hora: '10:00',
    tecnicoId: '',
  });

  const isStaff = user?.role === 'ADMIN' || user?.role === 'TECNICO';

  useEffect(() => {
    if (!user) return;
    fetchTecnicos();
    if (isStaff) {
      fetchTodasCitas();
    } else {
      fetchCitasByCliente(user.id);
    }
  }, [user]);

  const handleRefresh = () => {
    if (isStaff) fetchTodasCitas();
    else fetchCitasByCliente(user.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tecnicoId) {
      alert('Por favor selecciona un técnico');
      return;
    }
    const fechaHora = `${formData.fecha}T${formData.hora}:00`;
    const result = await crearCita({
      nombre: formData.nombre || user.fullName || user.username,
      apellido: formData.apellido || '',
      email: user.email || `${user.username}@techfix.cl`,
      telefono: formData.telefono,
      tipoServicio: formData.tipoServicio,
      descripcion: formData.descripcion,
      fechaHora,
      tecnicoId: parseInt(formData.tecnicoId),
    });
    if (result) {
      setFormData({
        nombre: '', apellido: '', email: '', telefono: '',
        tipoServicio: 'REPARACION', descripcion: '',
        fecha: '', hora: '10:00', tecnicoId: '',
      });
      fetchCitasByCliente(user.id);
      setActiveTab('mis-citas');
    }
  };

  const handleEstado = async (id, estado) => {
    const result = await actualizarEstado(id, estado);
    if (result) handleRefresh();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas cancelar esta cita?')) {
      const ok = await eliminarCita(id);
      if (ok) handleRefresh();
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <FiCalendar className="text-primary" /> Agendamiento de Visitas
          </h1>
          <p className="text-slate-600 mt-1">Solicita y gestiona visitas técnicas</p>
        </div>
        <button onClick={handleRefresh} className="text-slate-500 hover:text-primary transition-colors" title="Actualizar">
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {}
      <div className="flex border-b border-slate-200 mb-8 gap-1">
        {!isStaff && (
          <button
            onClick={() => setActiveTab('nueva')}
            className={`px-5 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'nueva' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FiPlus /> Nueva Cita
          </button>
        )}
        <button
          onClick={() => setActiveTab('mis-citas')}
          className={`px-5 py-3 text-sm font-medium transition-colors ${
            activeTab === 'mis-citas' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {isStaff ? '📋 Todas las Citas' : '📅 Mis Citas'}
        </button>
      </div>

      {}
      {activeTab === 'nueva' && !isStaff && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">📝 Solicitar Visita Técnica</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  placeholder={user.fullName || user.username}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono *</label>
                <input
                  type="tel"
                  required
                  placeholder="+56 9 1234 5678"
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Servicio *</label>
              <select
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.tipoServicio}
                onChange={(e) => setFormData({ ...formData, tipoServicio: e.target.value })}
              >
                <option value="REPARACION">🔧 Reparación</option>
                <option value="INSTALACION">💻 Instalación</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción del Problema *</label>
              <textarea
                required
                rows="3"
                placeholder="Describe el problema o servicio requerido..."
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hora *</label>
                <input
                  type="time"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Técnico Asignado *
              </label>
              {tecnicos.length === 0 ? (
                <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <FiTool className="inline mr-2" />
                  No hay técnicos disponibles. El administrador debe registrar técnicos primero.
                </div>
              ) : (
                <select
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.tecnicoId}
                  onChange={(e) => setFormData({ ...formData, tecnicoId: e.target.value })}
                >
                  <option value="">— Selecciona un técnico —</option>
                  {tecnicos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} {t.apellido}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || tecnicos.length === 0}
              className="w-full bg-primary hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <FiCalendar /> {loading ? 'Agendando...' : 'Solicitar Visita'}
            </button>
          </form>
        </div>
      )}

      {}
      {activeTab === 'mis-citas' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <FiRefreshCw className="animate-spin mr-3 text-2xl" /> Cargando citas...
            </div>
          ) : citas.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📅</div>
              <p className="text-slate-500">No hay citas registradas.</p>
              {!isStaff && (
                <button
                  onClick={() => setActiveTab('nueva')}
                  className="mt-4 inline-flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <FiPlus /> Agendar una visita
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Servicio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fecha/Hora</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Estado</th>
                    {isStaff && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {citas.map((cita) => (
                    <tr key={cita.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500">#{cita.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <div className="font-medium">
                          {cita.cliente ? `${cita.cliente.nombre} ${cita.cliente.apellido || ''}` : '—'}
                        </div>
                        {cita.cliente?.telefono && <div className="text-xs text-slate-400">{cita.cliente.telefono}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{cita.tipoServicio}</div>
                        <div className="text-xs text-slate-400 max-w-xs truncate">{cita.descripcion}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {cita.fechaHora ? new Date(cita.fechaHora).toLocaleString('es-CL') : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[cita.estado] || 'bg-slate-100 text-slate-700'}`}>
                          {cita.estado}
                        </span>
                      </td>
                      {isStaff && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {cita.estado === 'PENDIENTE' && (
                              <button
                                onClick={() => handleEstado(cita.id, 'EN_PROCESO')}
                                title="Iniciar"
                                className="text-orange-500 hover:text-orange-700 text-sm"
                              >
                                ▶ Iniciar
                              </button>
                            )}
                            {cita.estado === 'EN_PROCESO' && (
                              <button
                                onClick={() => handleEstado(cita.id, 'COMPLETADA')}
                                className="text-green-500 hover:text-green-700 text-sm"
                              >
                                <FiCheckCircle className="inline" /> Completar
                              </button>
                            )}
                            {cita.estado !== 'CANCELADA' && cita.estado !== 'COMPLETADA' && (
                              <button
                                onClick={() => handleDelete(cita.id)}
                                className="text-red-400 hover:text-red-600"
                                title="Cancelar"
                              >
                                <FiXCircle />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Agendamiento;
