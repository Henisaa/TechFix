import { useState, useEffect } from 'react';
import { useInventario } from '../hooks/useInventario';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ui/ProductCard';
import { FiSearch, FiPlus, FiRefreshCw, FiX, FiSave } from 'react-icons/fi';

const EMPTY_FORM = {
  sku: '',
  name: '',
  description: '',
  salePrice: '',
  quantityInStock: '',
  minStockLevel: 2,
};

const Catalogo = () => {
  const { user } = useAuth();
  const { productos, loading, fetchProductos, createProducto, deleteProducto } = useInventario();

  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchProductos(0, 100);
  }, [fetchProductos]);

  const productosFiltrados = productos.filter(
    (p) =>
      p.name?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.description?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.sku?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      salePrice: parseFloat(formData.salePrice),
      costPrice: parseFloat(formData.salePrice),
      quantityInStock: parseInt(formData.quantityInStock),
      minStockLevel: parseInt(formData.minStockLevel),
      status: 'ACTIVE',
    };
    const result = await createProducto(payload);
    if (result) {
      setShowModal(false);
      setFormData(EMPTY_FORM);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este producto del catálogo?')) {
      await deleteProducto(id);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Catálogo de Repuestos
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Encuentra componentes originales y certificados para asegurar el mejor rendimiento de tus equipos.
          </p>
        </div>

        {}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full sm:max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar repuesto..."
              className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchProductos(0, 100)}
              className="text-slate-500 hover:text-primary transition-colors"
              title="Actualizar"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium shadow-md transition-colors"
              >
                <FiPlus /> Añadir al Catálogo
              </button>
            )}
          </div>
        </div>

        {}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-400">
            <FiRefreshCw className="animate-spin mr-3 text-2xl" /> Cargando catálogo...
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔧</div>
            <p className="text-slate-500 text-lg">No se encontraron productos.</p>
            {isAdmin && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 inline-flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <FiPlus /> Agregar el primero
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productosFiltrados.map((producto) => (
              <div key={producto.id} className="relative group">
                <ProductCard
                  product={{
                    cod_repuesto: producto.sku,
                    nombre_repuesto: producto.name,
                    categoria: producto.categoryName || 'Sin categoría',
                    descripcion: producto.description,
                    precio_clp: producto.salePrice,
                    stock: producto.quantityInStock,
                    image: producto.imageUrl || `https://placehold.co/300x200/1e40af/ffffff?text=${encodeURIComponent(producto.name?.slice(0, 20) || 'Repuesto')}`,
                  }}
                />
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(producto.id)}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar del catálogo"
                  >
                    <FiX className="text-sm" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {}
      {showModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">➕ Agregar al Catálogo</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
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
                    placeholder="GPU-RTX4060-001"
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
                    placeholder="RTX 4060 Ti 8GB"
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
                  placeholder="Descripción del producto..."
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
                    placeholder="0"
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
                    placeholder="0"
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
                  <FiSave /> {loading ? 'Guardando...' : 'Agregar al Catálogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalogo;
