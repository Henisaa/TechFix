import { useState, useEffect } from 'react';
import { useInventario } from '../hooks/useInventario';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ui/ProductCard';
import { FiSearch, FiRefreshCw, FiX } from 'react-icons/fi';


const Catalogo = () => {
  const { user } = useAuth();
  const { productos, loading, fetchProductos, deleteProducto } = useInventario();

  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchProductos(0, 100);
  }, [fetchProductos]);

  const productosFiltrados = productos.filter(
    (p) =>
      p.name?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.description?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.sku?.toLowerCase().includes(busqueda.toLowerCase())
  );

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
          <button
            onClick={() => fetchProductos(0, 100)}
            className="text-slate-500 hover:text-primary transition-colors"
            title="Actualizar"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
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
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productosFiltrados.map((producto) => (
              <div key={producto.id} className="relative group">
                <ProductCard
                  product={{
                    id: producto.id,
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
    </div>
  );
};

export default Catalogo;
