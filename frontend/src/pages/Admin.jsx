import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUsuarios } from '../hooks/useUsuarios';
import { useInventario } from '../hooks/useInventario';
import { useAgendamiento } from '../hooks/useAgendamiento';
import { useAdminStats } from '../hooks/useAdminStats';
import {
  FiUsers, FiUserCheck, FiTool, FiActivity, FiPackage,
  FiPlus, FiX, FiSave, FiDollarSign,
  FiChevronLeft, FiChevronRight, FiImage, FiRefreshCw,
} from 'react-icons/fi';

const EMPTY_PRODUCT = { sku: '', name: '', description: '', price: '', stock: '', minStock: 2, imageUrl: '' };

const PIE_COLORS_PIEZAS = ['#6366f1', '#a78bfa', '#c4b5fd', '#ddd6fe'];
const PIE_COLORS_ORDENES = ['#f97316', '#fb923c', '#fdba74', '#fed7aa'];

function PieChart({ data, colors, title, total, formatValue }) {
  const [hovered, setHovered] = useState(null);

  const segments = useMemo(() => {
    const totalVal = data.reduce((s, d) => s + d.value, 0);
    if (totalVal === 0) return [];
    let cumAngle = -Math.PI / 2;
    return data.map((d, i) => {
      const fraction = d.value / totalVal;
      const startAngle = cumAngle;
      const endAngle = cumAngle + fraction * 2 * Math.PI;
      cumAngle = endAngle;
      const r = 70;
      const x1 = 90 + r * Math.cos(startAngle);
      const y1 = 90 + r * Math.sin(startAngle);
      const x2 = 90 + r * Math.cos(endAngle);
      const y2 = 90 + r * Math.sin(endAngle);
      const largeArc = fraction > 0.5 ? 1 : 0;
      const path = `M 90 90 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      return { ...d, path, color: colors[i % colors.length], fraction, index: i };
    });
  }, [data, colors]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 mb-4">Últimos 4 meses · datos en tiempo real</p>
      <div className="flex items-center gap-6 flex-1">
        <div className="relative flex-shrink-0">
          <svg width="180" height="180" viewBox="0 0 180 180">
            {segments.length > 0 ? segments.map((seg) => (
              <path
                key={seg.index}
                d={seg.path}
                fill={seg.color}
                stroke="white"
                strokeWidth="2"
                style={{
                  transform: hovered === seg.index ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: '90px 90px',
                  transition: 'transform 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHovered(seg.index)}
                onMouseLeave={() => setHovered(null)}
              />
            )) : (
              <>
                <circle cx="90" cy="90" r="70" fill="#f1f5f9" />
                <text x="90" y="88" textAnchor="middle" fontSize="10" fill="#94a3b8">Sin datos</text>
                <text x="90" y="104" textAnchor="middle" fontSize="9" fill="#94a3b8">disponibles</text>
              </>
            )}
            <circle cx="90" cy="90" r="40" fill="white" />
            <text x="90" y="84" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">TOTAL</text>
            <text x="90" y="100" textAnchor="middle" fontSize="9" fill="#1e293b" fontWeight="700">
              {formatValue(total)}
            </text>
          </svg>
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {data.map((d, i) => (
            <div
              key={i}
              className="flex items-center gap-2 cursor-pointer group"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
                style={{ background: colors[i % colors.length] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{d.label}</p>
                <p className="text-xs text-slate-400">{formatValue(d.value)}</p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {total > 0 ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const STAT_CARDS = [
  { key: 'usuarios', gradient: 'from-blue-500 to-blue-700', icon: FiUsers, emoji: '👥' },
  { key: 'activos', gradient: 'from-emerald-500 to-emerald-700', icon: FiUserCheck, emoji: '✅' },
  { key: 'tecnicos', gradient: 'from-orange-500 to-orange-700', icon: FiTool, emoji: '🔧' },
  { key: 'citas', gradient: 'from-violet-500 to-violet-700', icon: FiActivity, emoji: '📋' },
  { key: 'stock', gradient: 'from-teal-500 to-teal-700', icon: FiPackage, emoji: '📦' },
];

const Admin = () => {
  const { user } = useAuth();
  const { usuarios, fetchUsuarios } = useUsuarios();
  const { productos, stats, fetchProductos, fetchStats, createProducto, loading: loadingStock } = useInventario();
  const { citas, fetchTodasCitas } = useAgendamiento();

  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [imagePreview, setImagePreview] = useState(null);
  const [chartOffset, setChartOffset] = useState(0);
  const fileInputRef = useRef(null);

  const { piezasData, ordenesData, months, loading: loadingStats, refetch } = useAdminStats(chartOffset);

  useEffect(() => {
    fetchUsuarios();
    fetchProductos(0, 50);
    fetchStats();
    fetchTodasCitas();
  }, [fetchUsuarios, fetchProductos, fetchStats, fetchTodasCitas]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setImagePreview(base64);
      setProductForm((prev) => ({ ...prev, imageUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

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
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter((u) => u.active).length;
  const tecnicos = usuarios.filter((u) => u.role === 'TECNICO').length;
  const totalProductos = stats?.totalProducts ?? productos.length;
  const totalCitas = citas.length;
  const citasPendientes = citas.filter((c) => c.estado === 'PENDIENTE').length;

  const statValues = {
    usuarios: { title: 'Total Usuarios', value: totalUsuarios, sub: 'Registrados en el sistema' },
    activos: { title: 'Usuarios Activos', value: usuariosActivos, sub: 'Cuentas habilitadas' },
    tecnicos: { title: 'Técnicos', value: tecnicos, sub: 'Personal técnico registrado' },
    citas: { title: 'Citas / Órdenes', value: totalCitas, sub: `${citasPendientes} pendientes` },
    stock: { title: 'Repuestos en Stock', value: totalProductos, sub: 'Ítems en inventario' },
  };

  const totalPiezas = piezasData.reduce((s, d) => s + d.value, 0);
  const totalOrdenes = ordenesData.reduce((s, d) => s + d.value, 0);

  const formatCLP = (v) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v}`;
  };

  const quickLinks = [
    { href: '/usuarios', icon: FiUsers, label: 'Gestión de Usuarios', color: '#6366f1', bg: '#eef2ff' },
    { href: '/pagos', icon: FiDollarSign, label: 'Pagos y Facturación', color: '#8b5cf6', bg: '#f5f3ff' },
    { href: '/inventario', icon: FiPackage, label: 'Inventario', color: '#0d9488', bg: '#f0fdfa' },
    { href: '/agendamiento', icon: FiActivity, label: 'Agendamiento', color: '#f97316', bg: '#fff7ed' },
  ];

  const periodLabel = months.length > 0
    ? `${months[0]?.label} — ${months[months.length - 1]?.label}`
    : '';

  return (
    <div
      style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 50%, #fff7ed 100%)' }}
      className="py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">Bienvenido de vuelta,</p>
            <h1 className="text-3xl font-extrabold text-slate-900">
              {user?.fullName || user?.username}
            </h1>
            <p className="text-slate-500 text-sm mt-1">Panel de administración — TechFix</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400">Ganancias Piezas</p>
              <p className="text-2xl font-extrabold text-indigo-600">{formatCLP(totalPiezas)}</p>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-right">
              <p className="text-xs text-slate-400">Ganancias Órdenes</p>
              <p className="text-2xl font-extrabold text-orange-500">{formatCLP(totalOrdenes)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {STAT_CARDS.map(({ key, gradient, icon: Icon, emoji }) => {
            const { title, value, sub } = statValues[key];
            return (
              <div
                key={key}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-md hover:shadow-xl transition-all hover:-translate-y-1 cursor-default`}
              >
                <div className="absolute -right-4 -top-4 text-white/10 text-8xl select-none">{emoji}</div>
                <div className="mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                    <Icon />
                  </div>
                </div>
                <p className="text-white/80 text-xs font-medium mb-1">{title}</p>
                <h2 className="text-3xl font-extrabold leading-none mb-1">{value}</h2>
                <p className="text-white/60 text-xs">{sub}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Período analizado</h3>
                <p className="text-xs text-slate-400">{periodLabel}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChartOffset((o) => o - 1)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <FiChevronLeft className="text-slate-600 text-sm" />
                </button>
                <button
                  onClick={() => setChartOffset((o) => Math.min(0, o + 1))}
                  disabled={chartOffset >= 0}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors disabled:opacity-40"
                >
                  <FiChevronRight className="text-slate-600 text-sm" />
                </button>
                <button
                  onClick={refetch}
                  title="Actualizar datos"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <FiRefreshCw className={`text-slate-600 text-sm ${loadingStats ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-xs text-slate-600">Venta de Piezas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-400" />
                <span className="text-xs text-slate-600">Ganancias en Órdenes</span>
              </div>
            </div>
            {loadingStats && (
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <FiRefreshCw className="animate-spin" /> Actualizando datos...
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 flex items-center justify-between shadow-lg">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">🛒 Gestión de Catálogo</h2>
              <p className="text-slate-400 text-sm">Añade nuevos repuestos al sistema</p>
            </div>
            <button
              onClick={() => setShowProductModal(true)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-5 py-3 rounded-xl transition-colors shadow-md whitespace-nowrap"
            >
              <FiPlus /> Añadir Producto
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PieChart
            data={piezasData}
            colors={PIE_COLORS_PIEZAS}
            title="Ganancias — Venta de Piezas"
            total={totalPiezas}
            formatValue={formatCLP}
          />
          <PieChart
            data={ordenesData}
            colors={PIE_COLORS_ORDENES}
            title="Ganancias — Órdenes de Servicio"
            total={totalOrdenes}
            formatValue={formatCLP}
          />
        </div>

        <div className="mb-2">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Accesos Rápidos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map(({ href, icon: Icon, label, color, bg }) => (
              <a
                key={href}
                href={href}
                className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform"
                  style={{ background: bg, color }}
                >
                  <Icon />
                </div>
                <h3 className="font-bold text-slate-800 text-sm leading-tight">{label}</h3>
              </a>
            ))}
          </div>
        </div>
      </div>

      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">➕ Agregar Producto al Catálogo</h3>
              <button
                onClick={() => { setShowProductModal(false); setImagePreview(null); setProductForm(EMPTY_PRODUCT); }}
                className="text-slate-400 hover:text-slate-600 text-2xl transition-colors"
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Imagen del producto <span className="text-red-500">*</span>
                </label>
                <div
                  className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="h-32 object-contain mx-auto rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-4 text-slate-400">
                      <FiImage className="text-3xl" />
                      <p className="text-sm">Haz clic para seleccionar una imagen</p>
                      <p className="text-xs">JPG, PNG, WebP — max 2MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    required
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="GPU-RTX4060-001"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows="2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Mín.</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={productForm.minStock}
                    onChange={(e) => setProductForm({ ...productForm, minStock: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setShowProductModal(false); setImagePreview(null); setProductForm(EMPTY_PRODUCT); }}
                  className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingStock || !imagePreview}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-lg shadow-md transition-all disabled:opacity-60"
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

export default Admin;
