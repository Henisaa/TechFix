import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUsuarios } from '../hooks/useUsuarios';
import { useInventario } from '../hooks/useInventario';
import { useAgendamiento } from '../hooks/useAgendamiento';
import {
  FiUsers, FiUserCheck, FiTool, FiDollarSign, FiActivity, FiPackage,
  FiPlus, FiX, FiSave, FiRefreshCw, FiShield,
} from 'react-icons/fi';

const EMPTY_PRODUCT = { sku: '', name: '', description: '', price: '', stock: '', minStock: 2 };

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { usuarios, fetchUsuarios } = useUsuarios();
  const { productos, stats, fetchProductos, fetchStats, createProducto, loading: loadingStock } = useInventario();
  const { citas, fetchTodasCitas } = useAgendamiento();

  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);

  useEffect(() => {
    fetchUsuarios();
    fetchProductos(0, 50);
    fetchStats();
    fetchTodasCitas();
  }, [fetchUsuarios, fetchProductos, fetchStats, fetchTodasCitas]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const payload = {
      ...productForm,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock),
      minStock: parseInt(productForm.minStock),
    };
    const result = await createProducto(payload);
    if (result) {
      setShowProductModal(false);
      setProductForm(EMPTY_PRODUCT);
    }
  };

  
  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter((u) => u.active).length;
  const tecnicos = usuarios.filter((u) => u.role === 'TECNICO').length;
  const totalProductos = stats?.totalProducts ?? productos.length;
  const totalCitas = citas.length;
  const citasPendientes = citas.filter((c) => c.estado === 'PENDIENTE').length;

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Panel de Administración</h1>
        <p className="text-slate-600 mt-2">Bienvenido, {user?.fullName || user?.username} — Resumen del sistema TechFix</p>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard icon={<FiUsers />} title="Total Usuarios" value={totalUsuarios} desc="Usuarios registrados en el sistema" color="bg-blue-500" />
        <StatCard icon={<FiUserCheck />} title="Usuarios Activos" value={usuariosActivos} desc="Cuentas habilitadas" color="bg-green-500" />
        <StatCard icon={<FiTool />} title="Técnicos" value={tecnicos} desc="Personal técnico registrado" color="bg-orange-500" />
        <StatCard icon={<FiActivity />} title="Citas / Órdenes" value={totalCitas} desc={`${citasPendientes} pendientes`} color="bg-purple-500" />
        <StatCard icon={<FiPackage />} title="Repuestos en Stock" value={totalProductos} desc="Ítems en inventario" color="bg-teal-500" />
        <StatCard icon={<FiShield />} title="Rol Actual" value="ADMIN" desc="Control total del sistema" color="bg-slate-700" />
      </div>

      {}
      <div className="bg-gradient-to-r from-primary to-blue-700 rounded-2xl p-6 mb-10 flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">🛒 Gestión de Catálogo</h2>
          <p className="text-blue-100 text-sm">Agrega nuevos repuestos al catálogo del sistema</p>
        </div>
        <button
          onClick={() => setShowProductModal(true)}
          className="flex items-center gap-2 bg-white text-primary font-bold px-5 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-md"
        >
          <FiPlus /> Añadir Producto
        </button>
      </div>

      {}
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Accesos Rápidos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <QuickLink href="/usuarios" icon={<FiUsers />} label="Gestión de Usuarios" color="bg-blue-50 text-primary" />
        <QuickLink href="/pagos" icon={<FiDollarSign />} label="Pagos y Facturación" color="bg-purple-50 text-purple-600" />
        <QuickLink href="/inventario" icon={<FiPackage />} label="Inventario" color="bg-teal-50 text-teal-600" />
        <QuickLink href="/agendamiento" icon={<FiActivity />} label="Agendamiento" color="bg-orange-50 text-orange-600" />
      </div>

      {}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">➕ Agregar Producto al Catálogo</h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="GPU-RTX4060-001"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    placeholder="RTX 4060 Ti 8GB"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows="2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Precio CLP *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Mín.</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                    value={productForm.minStock}
                    onChange={(e) => setProductForm({ ...productForm, minStock: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 text-slate-600 font-medium">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingStock}
                  className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow-md transition-all"
                >
                  <FiSave /> {loadingStock ? 'Guardando...' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, title, value, desc, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-start gap-4">
    <div className={`mt-1 flex-shrink-0 h-12 w-12 rounded-xl text-white flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      <p className="text-xs text-slate-400 mt-1">{desc}</p>
    </div>
  </div>
);

const QuickLink = ({ href, icon, label, color }) => (
  <a
    href={href}
    className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-primary transition-all group flex flex-col items-center text-center"
  >
    <div className={`h-12 w-12 ${color} rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="font-bold text-slate-800 text-sm">{label}</h3>
  </a>
);

export default Admin;
