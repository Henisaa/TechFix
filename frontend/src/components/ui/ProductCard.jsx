const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(price);
};

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 group">
      <div className="aspect-w-16 aspect-h-10 w-full overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.nombre_repuesto}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold tracking-wider text-accent uppercase">
            {product.categoria}
          </span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {product.stock > 0 ? 'Disponible' : 'Agotado'}
          </span>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2">
          {product.nombre_repuesto}
        </h3>
        <p className="text-slate-500 text-sm mb-4 line-clamp-3">
          {product.descripcion}
        </p>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
          <span className="text-2xl font-bold text-slate-900">
            {formatPrice(product.precio_clp)}
          </span>
          <button className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Ver detalle
          </button>
        </div>
        <div className="mt-3 text-xs text-slate-400 font-mono">
          Cód: {product.cod_repuesto}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
