import { useState, useEffect } from 'react';
import { useInventario } from '../hooks/useInventario';
import { useAuth } from '../context/AuthContext';
import { FiPackage, FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiX, FiSave } from 'react-icons/fi';

const formatPrice = (price) => {
  if (!price) return '$0';
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
    .format(price)
    .replace('CLP', '')
    .trim();
};

const EMPTY_FORM = {
  sku: '',
  name: '',
  description: '',
  salePrice: '',
  quantityInStock: '',
  minStockLevel: 2,
  categoryId: '',
};

const Inventario = () => {
  const { user } = useAuth();
  const {
    productos,
    categorias,
    loading,
    fetchProductos,
    fetchCategorias,
    createProducto,
    updateProducto,
    deleteProducto,
  } = useInventario();

  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, [fetchProductos, fetchCategorias]);

  const productosFiltrados = productos.filter(
    (p) =>
      p.name?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.sku?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleOpenModal = (producto = null) => {
    if (producto) {
      setEditando(producto);
      setFormData({
        sku: producto.sku || '',
        name: producto.name || '',
        description: producto.description || '',
        salePrice: producto.salePrice || '',
        quantityInStock: producto.quantityInStock || '',
        minStockLevel: producto.minStockLevel || 2,
        categoryId: producto.categoryId || '',
      });
    } else {
      setEditando(null);
      setFormData(EMPTY_FORM);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      salePrice: parseFloat(formData.salePrice),
      costPrice: parseFloat(formData.salePrice),
      quantityInStock: parseInt(formData.quantityInStock),
      minStockLevel: parseInt(formData.minStockLevel),
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
    };
    let result;
    if (editando) {
      result = await updateProducto(editando.id, payload);
    } else {
      result = await createProducto(payload);
    }
    if (result) {
      setShowModal(false);
      setFormData(EMPTY_FORM);
      setEditando(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este producto del inventario?')) {
      await deleteProducto(id);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <FiPackage className="text-primary" /> Inventario de Repuestos
          </h1>
          <p className="text-slate-600 mt-1">Gestión de stock y piezas para reparación</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchProductos()}
            className="text-slate-500 hover:text-primary transition-colors"
            title="Actualizar"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
          {isAdmin && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-colors"
            >
              <FiPlus /> Agregar repuesto
            </button>
          )}
        </div>
      </div>

      {}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Precio CLP</th>
                {isAdmin && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-400">
                    <FiRefreshCw className="animate-spin inline mr-2" /> Cargando inventario...
                  </td>
                </tr>
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-400">
                    <div className="text-4xl mb-3">📦</div>
                    <p>No hay productos en el inventario.</p>
                    {isAdmin && (
                      <button
                        onClick={() => handleOpenModal()}
                        className="mt-3 inline-flex items-center gap-2 text-primary hover:underline text-sm"
                      >
                        <FiPlus /> Agregar el primer repuesto
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600">{p.sku}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{p.name}</div>
                      {p.description && (
                        <div className="text-xs text-slate-400 max-w-xs truncate">{p.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{p.category?.name || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          p.outOfStock
                            ? 'bg-red-100 text-red-800'
                            : p.lowStock
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {p.quantityInStock} uds.
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      ${formatPrice(p.salePrice)}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleOpenModal(p)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="Editar"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                            title="Eliminar"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">
                {editando ? '✏️ Editar Repuesto' : '➕ Nuevo Repuesto'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows="2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Precio Venta CLP *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.quantityInStock}
                    onChange={(e) => setFormData({ ...formData, quantityInStock: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Mín.</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow-md transition-all"
                >
                  <FiSave /> {loading ? 'Guardando...' : editando ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;
