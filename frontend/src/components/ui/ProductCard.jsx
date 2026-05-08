const formatPrice = (price) => {
  if (!price && price !== 0) return '$0';
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
    .format(price)
    .replace('CLP', '')
    .trim();
};

const ProductCard = ({ product }) => {
  const {
    cod_repuesto,
    nombre_repuesto,
    categoria,
    descripcion,
    precio_clp,
    stock,
    image,
  } = product;

  const stockBadge =
    stock === 0
      ? { label: 'Sin stock', cls: 'bg-red-100 text-red-700' }
      : stock <= 3
      ? { label: `${stock} uds. — Bajo`, cls: 'bg-yellow-100 text-yellow-700' }
      : { label: `${stock} en stock`, cls: 'bg-green-100 text-green-700' };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative overflow-hidden h-48 bg-slate-100">
        <img
          src={image}
          alt={nombre_repuesto}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = `https://placehold.co/300x200/1e40af/ffffff?text=${encodeURIComponent(nombre_repuesto?.slice(0, 15) || 'Repuesto')}`;
          }}
        />
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stockBadge.cls}`}>
            {stockBadge.label}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="text-xs text-slate-400 font-mono mb-1">{cod_repuesto}</div>
        <h3 className="font-bold text-slate-900 text-base mb-1 leading-tight">{nombre_repuesto}</h3>
        <p className="text-xs text-primary font-medium mb-2">{categoria}</p>
        {descripcion && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{descripcion}</p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-xl font-extrabold text-slate-900">${formatPrice(precio_clp)}</span>
          <span className="text-xs text-slate-400">CLP</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
