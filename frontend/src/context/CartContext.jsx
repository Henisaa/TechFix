import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'techfix_cart';

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, qty = 1 } = action.payload;
      const existing = state.find((item) => item.id === product.id);
      if (existing) {
        const newQty = existing.qty + qty;
        const capped = Math.min(newQty, product.quantityInStock);
        return state.map((item) =>
          item.id === product.id ? { ...item, qty: capped } : item
        );
      }
      return [
        ...state,
        {
          id: product.id,
          sku: product.sku,
          nombre: product.name,
          precio: product.salePrice,
          stock: product.quantityInStock,
          imagen: product.imageUrl || `https://placehold.co/300x200/1e40af/ffffff?text=${encodeURIComponent(product.name?.slice(0, 15) || 'Producto')}`,
          qty: Math.min(qty, product.quantityInStock),
        },
      ];
    }
    case 'REMOVE_ITEM':
      return state.filter((item) => item.id !== action.payload);
    case 'UPDATE_QTY': {
      const { id, qty } = action.payload;
      return state
        .map((item) => {
          if (item.id !== id) return item;
          const newQty = Math.max(0, Math.min(qty, item.stock));
          return { ...item, qty: newQty };
        })
        .filter((item) => item.qty > 0);
    }
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
};

const loadCart = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, [], loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1) => {
    if (!product || product.quantityInStock <= 0) return;
    dispatch({ type: 'ADD_ITEM', payload: { product, qty } });
  };

  const removeFromCart = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQty = (id, qty) => {
    dispatch({ type: 'UPDATE_QTY', payload: { id, qty } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.precio * item.qty, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
};
