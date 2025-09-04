import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Product } from '../hooks/useProducts';

// Extendemos Product para incluir cantidad
interface CartItem extends Product {
  quantity: number; // Cuántos productos del mismo tipo
}

// Estado del carrito
interface CartState {
  items: CartItem[]; // Productos en el carrito
  total: number; // Precio total
  itemCount: number; // Cantidad total de productos
}

// Acciones que puede hacer el carrito
type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product } // Agregar producto
  | { type: 'REMOVE_FROM_CART'; payload: number } // Eliminar por ID
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } } // Cambiar cantidad
  | { type: 'CLEAR_CART' }; // Vaciar carrito

// Crear el contexto
const CartContext = createContext<
  | {
      state: CartState;
      dispatch: React.Dispatch<CartAction>;
    }
  | undefined
>(undefined);

// Reducer: función que maneja los cambios del estado
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      // Buscar si el producto ya existe en el carrito
      const existingItem = state.items.find(item => item.id === action.payload.id);
      let newItems: CartItem[];

      if (existingItem) {
        // Si existe, aumentar cantidad
        newItems = state.items.map(item =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Si no existe, agregar nuevo con cantidad 1
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }

      // Recalcular total y contador
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
      };
    }

    case 'REMOVE_FROM_CART': {
      // Filtrar para eliminar el producto
      const newItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
      };
    }

    case 'UPDATE_QUANTITY': {
      // Actualizar cantidad específica
      const newItems = state.items
        .map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        )
        .filter(item => item.quantity > 0); // Eliminar si cantidad es 0

      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
      };
    }

    case 'CLEAR_CART':
      // Vaciar completamente el carrito
      return { items: [], total: 0, itemCount: 0 };

    default:
      return state;
  }
};

// Proveedor del contexto (envuelve toda la app)
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  });

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>;
};

// Hook personalizado para usar el carrito
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
};

// Exportar tipos para usar en otros archivos
export type { CartItem };
