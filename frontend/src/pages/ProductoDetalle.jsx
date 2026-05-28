import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useInventario } from '../hooks/useInventario';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import {
  FiShoppingCart, FiArrowLeft, FiAlertTriangle, FiPlus, FiMinus,
  FiTag, FiPackage, FiCheckCircle, FiXCircle,
} from 'react-icons/fi';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price ?? 0);

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const { productos, fetchProductos, loading } = useInventario();

  const [producto, setProducto] = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [qty, setQty] = useState(1);
  const [loadingLocal, setLoadingLocal] = useState(true);

  // Busca el producto por ID
  useEffect(() => {
    const loadProducto = async () => {
      setLoadingLocal(true);
      await fetchProductos(0, 200);
    };
    loadProducto();
  }, [id]);

  // Una vez cargados los productos, filtra el actual y los relacionados
  useEffect(() => {
    if (productos.length === 0) return;
    const found = productos.find((p) => String(p.id) === String(id));
    setProducto(found || null);
    if (found) {
      const rel = productos
        .filter((p) => String(p.id) !== String(id))
        .filter((p) => !found.categoryName || p.categoryName === found.categoryName)
        .slice(0, 4);
      // Si no hay suficientes de la misma categoría, completa con otros
      if (rel.length < 4) {
        const extra = productos
          .filter((p) => String(p.id) !== String(id) && p.categoryName !== found.categoryName)
          .slice(0, 4 - rel.length);
        setRelacionados([...rel, ...extra]);
      } else {
        setRelacionados(rel);
      }
    }
    setLoadingLocal(false);
  }, [productos, id]);

  // Stock del producto
  const stock = producto?.quantityInStock ?? 0;
  const stockExcedido = qty > stock;
  const sinStock = stock <= 0;

  // Ajusta qty cuando cambia el producto
  useEffect(() => {
    setQty(1);
  }, [id]);

  const handleQtyChange = (val) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) {
      setQty(1);
      return;
    }
    setQty(parsed); // Permitimos escribir el valor aunque exceda para que la UI lo detecte
  };

  const handleDecrement = () => setQty((q) => Math.max(1, q - 1));
  const handleIncrement = () => {
    if (qty >= stock) return; // bloquea al límite
    setQty((q) => q + 1);
  };

  const handleAddToCart = () => {
    if (!producto || sinStock || stockExcedido) return;
    const normalized = {
      id: producto.id,
      sku: producto.sku,
      name: producto.name,
      salePrice: producto.salePrice,
      quantityInStock: producto.quantityInStock,
      imageUrl: producto.imageUrl,
    };
    addToCart(normalized, qty);
    toast.success(`${qty} × "${producto.name}" añadido al carrito`, { icon: '🛒' });
  };

  // Loading
  if (loadingLocal || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-lg">Cargando producto...</p>
        </div>
      </div>
    );
  }

  // No encontrado
  if (!producto) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="text-6xl">🔍</div>
        <h2 className="text-2xl font-bold text-slate-800">Producto no encontrado</h2>
        <p className="text-slate-500">El producto con ID #{id} no existe en el catálogo.</p>
        <Link to="/catalogo" className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
          <FiArrowLeft /> Volver al catálogo
        </Link>
      </div>
    );
  }

  const imgSrc = producto.imageUrl ||
    `https://placehold.co/600x400/1e40af/ffffff?text=${encodeURIComponent(producto.name?.slice(0, 20) || 'Repuesto')}`;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
          <span>/</span>
          <Link to="/catalogo" className="hover:text-primary transition-colors">Catálogo</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-xs">{producto.name}</span>
        </nav>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

          {/* Columna izquierda — Imagen */}
          <div>
            <div className="bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <img
                src={imgSrc}
                alt={producto.name}
                className="w-full h-80 lg:h-96 object-contain p-6"
              />
            </div>
          </div>

          {/* Columna derecha — Info + Compra */}
          <div className="flex flex-col gap-5">

            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold tracking-widest text-accent uppercase">
                  {producto.categoryName || 'Sin categoría'}
                </span>
                {sinStock ? (
                  <span className="flex items-center gap-1 text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    <FiXCircle /> Agotado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    <FiCheckCircle /> Disponible
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-1">
                {producto.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <FiTag className="text-xs" /> SKU: {producto.sku || '—'}
                </span>
                <span className="flex items-center gap-1">
                  <FiPackage className="text-xs" /> ID: #{producto.id}
                </span>
              </div>
            </div>

            {/* Precio */}
            <div className="bg-slate-50 rounded-xl px-5 py-4 border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Precio de venta</p>
              <p className="text-4xl font-extrabold text-slate-900">
                {formatPrice(producto.salePrice)}
              </p>
            </div>

            {/* Descripción */}
            {producto.description && (
              <p className="text-slate-600 leading-relaxed text-sm">
                {producto.description}
              </p>
            )}

            {/* Stock info */}
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <FiPackage className="text-primary" />
              {sinStock ? (
                <span className="text-red-600 font-medium">Sin unidades disponibles</span>
              ) : (
                <span>
                  <strong className="text-slate-800">{stock}</strong> unidad{stock !== 1 ? 'es' : ''} disponible{stock !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Alerta de sobrestock */}
            {stockExcedido && !sinStock && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm animate-pulse-once">
                <FiAlertTriangle className="text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Cantidad no disponible</p>
                  <p>Solo hay <strong>{stock}</strong> unidad{stock !== 1 ? 'es' : ''} en stock. Reduce la cantidad para continuar.</p>
                </div>
              </div>
            )}

            {/* Selector de cantidad */}
            {!sinStock && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700">Cantidad:</span>
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden">
                  <button
                    onClick={handleDecrement}
                    disabled={qty <= 1}
                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-r border-slate-300"
                  >
                    <FiMinus />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={stock}
                    value={qty}
                    onChange={(e) => handleQtyChange(e.target.value)}
                    className={`w-16 text-center py-2 text-base font-semibold focus:outline-none border-0 ${
                      stockExcedido ? 'text-red-600 bg-red-50' : 'text-slate-900 bg-white'
                    }`}
                  />
                  <button
                    onClick={handleIncrement}
                    disabled={qty >= stock}
                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-l border-slate-300"
                  >
                    <FiPlus />
                  </button>
                </div>
                {stockExcedido && (
                  <span className="text-red-500 text-xs font-medium">Máx: {stock}</span>
                )}
              </div>
            )}

            {/* Botón Añadir al carrito */}
            <button
              onClick={handleAddToCart}
              disabled={sinStock || stockExcedido}
              className={`flex items-center justify-center gap-3 w-full py-4 rounded-xl text-base font-bold transition-all shadow-md ${
                sinStock || stockExcedido
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-primary hover:bg-blue-700 text-white hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              <FiShoppingCart className="text-xl" />
              {sinStock
                ? 'Sin stock disponible'
                : stockExcedido
                ? `Reduce la cantidad (máx. ${stock})`
                : `Añadir ${qty} al carrito — ${formatPrice(producto.salePrice * qty)}`}
            </button>

            {/* Subtotal */}
            {!sinStock && !stockExcedido && qty > 1 && (
              <p className="text-center text-sm text-slate-500">
                Subtotal: <strong className="text-slate-800">{formatPrice(producto.salePrice * qty)}</strong>
              </p>
            )}

          </div>
        </div>

        {/* Productos relacionados */}
        {relacionados.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Productos relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relacionados.map((p) => {
                const relImg = p.imageUrl ||
                  `https://placehold.co/300x200/1e40af/ffffff?text=${encodeURIComponent(p.name?.slice(0, 15) || 'Repuesto')}`;
                return (
                  <Link
                    key={p.id}
                    to={`/catalogo/${p.id}`}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group"
                  >
                    <img src={relImg} alt={p.name} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="p-4">
                      <p className="text-xs text-accent font-semibold uppercase tracking-wide mb-1 truncate">{p.categoryName || '—'}</p>
                      <h3 className="text-sm font-bold text-slate-800 line-clamp-2 mb-2">{p.name}</h3>
                      <p className="text-base font-bold text-slate-900">{formatPrice(p.salePrice)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default ProductoDetalle;
