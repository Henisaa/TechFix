import { useState, useEffect } from 'react';
import { useUsuarios } from '../hooks/useUsuarios';
import StatusBadge from '../components/ui/StatusBadge';
import { FiUserPlus, FiEdit2, FiTrash2, FiShield, FiRefreshCw, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Usuarios = () => {
  const { usuarios, loading, fetchUsuarios, createUsuario, toggleStatus, deleteUsuario, assignRole } = useUsuarios();
  const { user: currentUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'CLIENTE'
  });

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const success = await createUsuario(formData);
    if (success) {
      setIsModalOpen(false);
      setFormData({ username: '', email: '', password: '', fullName: '', role: 'CLIENTE' });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      deleteUsuario(id);
    }
  };

  const handleRoleChange = (id, newRole) => {
    assignRole(id, newRole);
  };

  const filteredUsuarios = roleFilter === 'ALL' 
    ? usuarios 
    : usuarios.filter(u => u.role === roleFilter);

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Usuarios</h1>
          <p className="text-slate-600 mt-2">Administra los roles y accesos del sistema</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-colors"
        >
          <FiUserPlus /> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Filtrar por rol:</span>
            <select 
              className="text-sm border-slate-300 rounded-md focus:ring-primary focus:border-primary"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">Todos</option>
              <option value="ADMIN">Administradores</option>
              <option value="TECNICO">Técnicos</option>
              <option value="CLIENTE">Clientes</option>
            </select>
          </div>
          <button onClick={fetchUsuarios} className="text-slate-500 hover:text-primary transition-colors" title="Actualizar lista">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUsuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">#{u.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold mr-3">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{u.fullName}</div>
                        <div className="text-sm text-slate-500">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      className="text-sm border-slate-300 rounded text-slate-700 bg-transparent"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={u.id === currentUser.id && u.role === 'ADMIN'}
                    >
                      <option value="CLIENTE">CLIENTE</option>
                      <option value="TECNICO">TECNICO</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={u.active ? 'ACTIVO' : 'INACTIVO'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => toggleStatus(u.id)}
                        className={`text-xl ${u.active ? 'text-green-600 hover:text-green-800' : 'text-slate-400 hover:text-slate-600'}`}
                        title={u.active ? "Desactivar" : "Activar"}
                        disabled={u.id === currentUser.id && u.role === 'ADMIN'}
                      >
                        {u.active ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)}
                        className={`text-lg ${u.id === currentUser.id && u.role === 'ADMIN' ? 'text-slate-300 cursor-not-allowed' : 'text-red-500 hover:text-red-700'}`}
                        title="Eliminar"
                        disabled={u.id === currentUser.id && u.role === 'ADMIN'}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsuarios.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-slate-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-auto my-6">
            <div className="relative flex flex-col w-full bg-white border-0 rounded-2xl shadow-2xl outline-none focus:outline-none">
              <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t-2xl">
                <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <FiUserPlus className="text-primary" /> Registrar Usuario
                </h3>
                <button
                  className="p-1 ml-auto bg-transparent border-0 text-slate-400 float-right text-3xl leading-none font-semibold outline-none focus:outline-none hover:text-slate-600"
                  onClick={() => setIsModalOpen(false)}
                >
                  <span className="block h-6 w-6 text-2xl outline-none focus:outline-none">×</span>
                </button>
              </div>
              <div className="relative p-6 flex-auto">
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de Usuario</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rol Inicial</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="CLIENTE">Usuario (Cliente)</option>
                      <option value="TECNICO">Técnico</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-end p-4 border-t border-solid border-slate-200 rounded-b mt-6">
                    <button
                      className="text-slate-500 background-transparent font-bold px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      className="bg-primary text-white active:bg-blue-600 font-bold text-sm px-6 py-3 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      type="submit"
                    >
                      Guardar Usuario
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
