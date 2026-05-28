import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCarritoApi } from '../hooks/useCarritoApi';
import CardPaymentForm from '../components/ui/CardPaymentForm';
import {
  FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiAlertTriangle,
  FiCreditCard, FiCheckCircle, FiArrowLeft, FiPackage,
} from 'react-icons/fi';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price ?? 0);

const METODOS_PAGO = [
  { value: 'EFECTIVO',        label: '💵 Efectivo' },
  { value: 'TARJETA_DEBITO',  label: '💳 Tarjeta de Débito' },
  { value: 'TARJETA_CREDITO', label: '💳 Tarjeta de Crédito' },
  { value: 'TRANSFERENCIA',   label: '🏦 Transferencia' },
];

const isCardMethod = (m) => m === 'TARJETA_DEBITO' || m === 'TARJETA_CREDITO';

const getReferenciaInfo = (metodo) => {
  switch (metodo) {
    case 'TRANSFERENCIA':
      return { label: 'Número de operación bancaria', placeholder: 'Ej: 123456789', required: true };
    default:
      return { label: 'Número de recibo (opcional)', placeholder: 'Se genera automáticamente si se deja vacío', required: false };
  }
};

const PagoCarrito = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, updateQty, removeFromCart, clearCart, totalPrice } = useCart();
  const { confirmarOrden, loading } = useCarritoApi();

  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [referenciaExterna, setReferenciaExterna] = useState('');
  const [ordenConfirmada, setOrdenConfirmada] = useState(null);
  const [cardData, setCardData] = useState({ masked: '', valid: false });

  const referenciaInfo = getReferenciaInfo(metodoPago);
  const esMetodoTarjeta = isCardMethod(metodoPago);

  // Detecta ítems con sobrestock
  const itemsConProblema = cart.filter((item) => item.qty > item.stock);
  const hayProblemas = itemsConProblema.length > 0;

  useEffect(() => {
    setReferenciaExterna('');
    setCardData({ masked: '', valid: false });
  }, [metodoPago]);

  // Redirige si el carrito está vacío y no hay orden confirmada
  useEffect(() => {
    if (cart.length === 0 && !ordenConfirmada) {
      // No redirigimos inmediatamente para no interrumpir flujos
    }
  }, [cart, ordenConfirmada]);

  const handleQty = (item, newQty) => {
    if (newQty < 1) return;
    if (newQty > item.stock) return; // bloquea escritura por encima del stock
    updateQty(item.id, newQty);
  };

  const handlePagar = async (e) => {
    e.preventDefault();
    if (hayProblemas || !user) return;
    if (esMetodoTarjeta && !cardData.valid) return;

    const refFinal = esMetodoTarjeta ? cardData.masked : referenciaExterna.trim();

    const items = cart.map((item) => ({
      productoId: item.id,
      cantidad: item.qty,
      precioUnitario: item.precio,
    }));

    const orden = await confirmarOrden({
      clienteId: user.id,
      metodoPago,
      referenciaExterna: refFinal,
      items,
    });

    if (orden) {
      clearCart();
      setOrdenConfirmada(orden);
    }
  };

  // Pantalla de confirmación exitosa
  if (ordenConfirmada) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-green-200 p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-green-600 text-4xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">¡Compra exitosa!</h1>
          <p className="text-slate-500 mb-6">Tu orden ha sido procesada correctamente.</p>
          <div className="bg-slate-50 rounded-xl p-4 text-left mb-6">
            <p className="text-sm text-slate-500">ID de Orden</p>
            <p className="text-2xl font-bold text-primary">#{ordenConfirmada.id}</p>
            <p className="text-sm text-slate-500 mt-2">Total pagado</p>
            <p className="text-xl font-bold text-slate-900">{formatPrice(ordenConfirmada.montoTotal)}</p>
            <p className="text-sm text-slate-500 mt-2">Método de pago</p>
            <p className="text-base font-medium text-slate-700">{ordenConfirmada.metodoPago}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/catalogo"
              className="bg-primary hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Seguir comprando
            </Link>
            <Link
              to="/ordenes"
              className="border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Ver mis órdenes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Carrito vacío
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="text-7xl">🛒</div>
        <h2 className="text-2xl font-bold text-slate-800">Tu carrito está vacío</h2>
        <p className="text-slate-500 max-w-sm">Agrega productos desde el catálogo para comenzar tu compra.</p>
        <Link
          to="/catalogo"
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md"
        >
          <FiShoppingCart /> Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <Link to="/catalogo" className="flex items-center gap-2 text-slate-500 hover:text-primary text-sm mb-4 transition-colors">
          <FiArrowLeft /> Seguir comprando
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <FiShoppingCart className="text-primary" /> Resumen de tu Compra
        </h1>
        <p className="text-slate-500 mt-1">{cart.length} ítem{cart.length !== 1 ? 's' : ''} en tu carrito</p>
      </div>

      {/* Alerta global de sobrestock */}
      {hayProblemas && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
          <FiAlertTriangle className="text-2xl flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Hay productos que superan el stock disponible</p>
            <p className="text-sm mt-1">
              Ajusta las cantidades de los productos marcados en rojo para poder continuar con el pago.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Lista de ítems */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const excede = item.qty > item.stock;
            const imgSrc = item.imagen ||
              `https://placehold.co/80x80/1e40af/ffffff?text=${encodeURIComponent(item.nombre?.slice(0, 8) || 'Item')}`;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-5 flex gap-5 transition-all ${
                  excede ? 'border-red-300 bg-red-50 shadow-sm' : 'border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Imagen */}
                <img
                  src={imgSrc}
                  alt={item.nombre}
                  className="w-20 h-20 object-cover rounded-xl flex-shrink-0 bg-slate-100"
                />

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 truncate text-sm">{item.nombre}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {item.sku || '—'} · ID: #{item.id}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
                      title="Eliminar"
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3 gap-4 flex-wrap">
                    {/* Control de cantidad */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQty(item, item.qty - 1)}
                        disabled={item.qty <= 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                      >
                        <FiMinus className="text-xs" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.stock}
                        value={item.qty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) updateQty(item.id, Math.max(1, Math.min(val, item.stock)));
                        }}
                        className={`w-14 text-center text-sm font-bold border rounded-lg py-1.5 focus:outline-none focus:ring-2 ${
                          excede
                            ? 'border-red-400 text-red-600 bg-red-50 focus:ring-red-300'
                            : 'border-slate-300 text-slate-800 focus:ring-primary'
                        }`}
                      />
                      <button
                        onClick={() => handleQty(item, item.qty + 1)}
                        disabled={item.qty >= item.stock}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                      >
                        <FiPlus className="text-xs" />
                      </button>
                    </div>

                    {/* Precio */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{formatPrice(item.precio * item.qty)}</p>
                      <p className="text-xs text-slate-400">{formatPrice(item.precio)} c/u</p>
                    </div>
                  </div>

                  {/* Alerta de stock por ítem */}
                  {excede && (
                    <div className="mt-2 flex items-center gap-2 text-red-600 text-xs font-medium">
                      <FiAlertTriangle />
                      Solo hay <strong>{item.stock}</strong> unidad{item.stock !== 1 ? 'es' : ''} disponible{item.stock !== 1 ? 's' : ''}. Reduce la cantidad.
                    </div>
                  )}

                  {/* Indicador de stock disponible */}
                  {!excede && (
                    <div className="mt-2 flex items-center gap-1 text-slate-400 text-xs">
                      <FiPackage className="text-xs" />
                      Stock disponible: {item.stock}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Panel de pago */}
        <div className="lg:col-span-1">
          <form
            onSubmit={handlePagar}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24"
          >
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <FiCreditCard className="text-primary" /> Datos de Pago
            </h2>

            {/* Resumen */}
            <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} uds.)</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-lg text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Método de pago */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Método de Pago</label>
              <select
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
              >
                {METODOS_PAGO.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Formulario de tarjeta o referencia */}
            {esMetodoTarjeta ? (
              <div className="mb-6">
                <CardPaymentForm
                  onCardData={setCardData}
                  disabled={loading}
                />
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {referenciaInfo.label}
                  {referenciaInfo.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="text"
                  required={referenciaInfo.required}
                  placeholder={referenciaInfo.placeholder}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={referenciaExterna}
                  onChange={(e) => setReferenciaExterna(e.target.value)}
                />
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading || hayProblemas || cart.length === 0 || (esMetodoTarjeta && !cardData.valid)}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all ${
                loading || hayProblemas || cart.length === 0 || (esMetodoTarjeta && !cardData.valid)
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Procesando...
                </>
              ) : hayProblemas ? (
                <>
                  <FiAlertTriangle /> Ajusta las cantidades primero
                </>
              ) : (
                <>
                  <FiCheckCircle className="text-lg" /> Confirmar Pago
                </>
              )}
            </button>

            {hayProblemas && (
              <p className="text-xs text-red-500 text-center mt-2">
                {itemsConProblema.length} ítem{itemsConProblema.length !== 1 ? 's' : ''} con stock insuficiente
              </p>
            )}
          </form>
        </div>

      </div>
    </div>
  );
};

export default PagoCarrito;
