import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FiShoppingCart, FiEye, FiAlertCircle } from 'react-icons/fi';

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(price);
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  
  const normalized = {
    id: product.id,
    sku: product.cod_repuesto || product.sku,
    name: product.nombre_repuesto || product.name,
    salePrice: product.precio_clp ?? product.salePrice ?? 0,
    quantityInStock: product.stock ?? product.quantityInStock ?? 0,
    imageUrl: product.image || product.imageUrl,
    description: product.descripcion || product.description,
    categoryName: product.categoria || product.categoryName,
  };

  const sinStock = normalized.quantityInStock <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (sinStock) return;
    addToCart(normalized, 1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 group flex flex-col">
      
      <div className="w-full overflow-hidden bg-slate-100">
        <img
          src={normalized.imageUrl || `https://placehold.co/300x200/1e40af/ffffff?text=${encodeURIComponent(normalized.name?.slice(0, 15) || 'Repuesto')}`}
          alt={normalized.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold tracking-wider text-accent uppercase truncate max-w-[70%]">
            {normalized.categoryName || 'Sin categoría'}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
            sinStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {sinStock ? 'Agotado' : `Stock: ${normalized.quantityInStock}`}
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-800 mb-1 line-clamp-2 leading-snug">
          {normalized.name}
        </h3>

        <p className="text-slate-500 text-sm mb-3 line-clamp-2 flex-grow">
          {normalized.description || 'Sin descripción'}
        </p>

        <div className="text-xs text-slate-400 font-mono mb-3">
          Cód: {normalized.sku || '—'}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-auto gap-2">
          <span className="text-xl font-bold text-slate-900">
            {formatPrice(normalized.salePrice)}
          </span>
          <div className="flex gap-2">
            <Link
              to={`/catalogo/${normalized.id}`}
              className="flex items-center gap-1 text-primary border border-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              title="Ver detalle"
            >
              <FiEye className="text-sm" />
              Detalle
            </Link>
            <button
              onClick={handleAddToCart}
              disabled={sinStock}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sinStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-blue-700 text-white'
              }`}
              title={sinStock ? 'Sin stock disponible' : 'Añadir al carrito'}
            >
              {sinStock ? <FiAlertCircle className="text-sm" /> : <FiShoppingCart className="text-sm" />}
              {sinStock ? 'Agotado' : 'Añadir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
