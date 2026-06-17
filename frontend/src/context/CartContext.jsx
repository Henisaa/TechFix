import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const STORAGE_KEY = 'techfix_carts';

const cartReducer = (state, action) => {
  const { userId } = action;
  const userCart = state[userId] || [];

  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, qty = 1 } = action.payload;
      const existing = userCart.find((item) => item.id === product.id);
      let newCart;
      if (existing) {
        const newQty = existing.qty + qty;
        const capped = Math.min(newQty, product.quantityInStock);
        newCart = userCart.map((item) =>
          item.id === product.id ? { ...item, qty: capped } : item
        );
      } else {
        newCart = [
          ...userCart,
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
      return {
        ...state,
        [userId]: newCart
      };
    }
    case 'REMOVE_ITEM': {
      const newCart = userCart.filter((item) => item.id !== action.payload);
      return {
        ...state,
        [userId]: newCart
      };
    }
    case 'UPDATE_QTY': {
      const { id, qty } = action.payload;
      const newCart = userCart
        .map((item) => {
          if (item.id !== id) return item;
          const newQty = Math.max(0, Math.min(qty, item.stock));
          return { ...item, qty: newQty };
        })
        .filter((item) => item.qty > 0);
      return {
        ...state,
        [userId]: newCart
      };
    }
    case 'CLEAR_CART':
      return {
        ...state,
        [userId]: []
      };
    default:
      return state;
  }
};

const loadCarts = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user ? (user.id || user.username || 'guest') : 'guest';

  const [carts, dispatch] = useReducer(cartReducer, {}, loadCarts);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carts));
  }, [carts]);

  const cart = carts[userId] || [];

  const addToCart = (product, qty = 1) => {
    if (!product || product.quantityInStock <= 0) return;
    dispatch({ type: 'ADD_ITEM', userId, payload: { product, qty } });
  };

  const removeFromCart = (id) => {
    dispatch({ type: 'REMOVE_ITEM', userId, payload: id });
  };

  const updateQty = (id, qty) => {
    dispatch({ type: 'UPDATE_QTY', userId, payload: { id, qty } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART', userId });
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
