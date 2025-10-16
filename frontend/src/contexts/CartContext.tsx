// src/contexts/CartContext.tsx
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Product } from '../hooks/useProducts';
import { useAuth } from './AuthContext';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

// --- Interfaces (sin cambios) ---
export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  image: string;
  cartItemId: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_PRODUCTS_TO_CART'; payload: { product: Product; quantity: number; size: string; color: string; image: string } }
  | { type: 'REMOVE_FROM_CART'; payload: { cartItemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { cartItemId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<
  | {
      state: CartState;
      dispatch: React.Dispatch<CartAction>;
    }
  | undefined
>(undefined);

// --- Reducer (sin cambios) ---
const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newItems: CartItem[] = [...state.items];
  switch (action.type) {
    case 'SET_CART':
      newItems = action.payload;
      break;
    case 'ADD_PRODUCTS_TO_CART': {
      const { product, quantity, size, color, image } = action.payload;
      const cartItemId = `${product._id}-${color}-${size}`;
      const existingItem = state.items.find(item => item.cartItemId === cartItemId);
      
      const variant = product.variants.find(v => v.colorName === color);
      const sizeInfo = variant?.sizes.find(s => s.size === size);
      const availableStock = sizeInfo ? sizeInfo.stock : 0;

      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantity, availableStock);
        newItems = state.items.map(item =>
          item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
        );
      } else {
        const newQuantity = Math.min(quantity, availableStock);
        if (newQuantity > 0) {
            newItems = [...state.items, { ...product, quantity: newQuantity, selectedSize: size, selectedColor: color, image, cartItemId }];
        }
      }
      break;
    }
    case 'REMOVE_FROM_CART': {
      newItems = state.items.filter(item => item.cartItemId !== action.payload.cartItemId);
      break;
    }
    case 'UPDATE_QUANTITY': {
        const { cartItemId, quantity } = action.payload;
        const itemToUpdate = state.items.find(item => item.cartItemId === cartItemId);
        if (!itemToUpdate) return state;

        const variant = itemToUpdate.variants.find(v => v.colorName === itemToUpdate.selectedColor);
        const sizeInfo = variant?.sizes.find(s => s.size === itemToUpdate.selectedSize);
        const availableStock = sizeInfo ? sizeInfo.stock : 0;
        
        const newQuantity = Math.min(Math.max(0, quantity), availableStock);
        newItems = state.items
            .map(item =>
            item.cartItemId === cartItemId
                ? { ...item, quantity: newQuantity }
                : item
            )
            .filter(item => item.quantity > 0);
        break;
    }
    case 'CLEAR_CART':
      newItems = [];
      break;
    default:
      return state;
  }
  
  const newState = {
    ...state,
    items: newItems,
    total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
  };
  return newState;
};

// ✅ [NUEVO] Función para inicializar el estado del carrito
const initializeState = (): CartState => {
  try {
    // Intentamos leer el carrito de invitados desde localStorage.
    const localGuestCart = localStorage.getItem('guestCart');
    if (localGuestCart) {
      console.log("🛒 Carrito de invitado encontrado en localStorage.");
      return JSON.parse(localGuestCart);
    }
  } catch (error) {
    console.error("Error al leer el carrito de localStorage:", error);
    localStorage.removeItem('guestCart'); // Limpiamos si hay datos corruptos.
  }
  // Si no hay nada, devolvemos un estado vacío.
  return { items: [], total: 0, itemCount: 0 };
};


export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated, user, setCartDispatch } = useAuth();
    // ✅ [MODIFICADO] Usamos nuestra función 'initializeState' para el estado inicial.
    const [state, dispatch] = useReducer(cartReducer, initializeState());
  
    useEffect(() => {
      if (setCartDispatch) {
          setCartDispatch(dispatch);
      }
    }, [setCartDispatch]);
  
    useEffect(() => {
      const fetchCart = async () => {
        if (isAuthenticated && user) {
          try {
            // ✅ [NUEVO] Si el usuario se autentica, limpiamos el carrito de invitado.
            localStorage.removeItem('guestCart');
            console.log("Usuario autenticado. Limpiando carrito de invitado de localStorage.");

            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/users/${user._id}/cart`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const cartFromDB = res.data.cart.map((item: any) => ({
                ...item.product,
                quantity: item.quantity,
                selectedSize: item.selectedSize,
                selectedColor: item.selectedColor || '',
                image: item.image || item.product?.variants[0]?.images[0],
                cartItemId: `${item.product._id}-${item.selectedColor}-${item.selectedSize}`
            }));
            dispatch({ type: 'SET_CART', payload: cartFromDB });
          } catch (error) {
            console.error("Error al cargar el carrito del usuario:", error);
          }
        } else {
            // Si el usuario cierra sesión, el estado se limpiará y el efecto de abajo guardará el estado vacío en localStorage.
        }
      };
      fetchCart();
    }, [isAuthenticated, user]);
  
    useEffect(() => {
      const syncCart = async () => {
          if(isAuthenticated && user) {
              try {
                  const token = localStorage.getItem('token');
                  const cartToSync = state.items.map(item => ({
                      product: item._id,
                      quantity: item.quantity,
                      selectedSize: item.selectedSize,
                      selectedColor: item.selectedColor,
                      image: item.image,
                  }));
  
                  await axios.put(`${API_URL}/users/${user._id}/cart`, 
                      { cart: cartToSync },
                      { headers: { 'Authorization': `Bearer ${token}` } }
                  );
              } catch (error) {
                  console.error("Error al sincronizar el carrito con el servidor:", error);
              }
          }
      };

      if (isAuthenticated) {
        syncCart();
      }
    }, [state.items, isAuthenticated, user]);

    // ✅ [NUEVO] useEffect para guardar el carrito en localStorage para invitados.
    useEffect(() => {
        // Este efecto se ejecuta solo si el usuario NO está autenticado.
        if (!isAuthenticated) {
            try {
                localStorage.setItem('guestCart', JSON.stringify(state));
            } catch (error) {
                console.error("Error al guardar el carrito de invitado en localStorage:", error);
            }
        }
    }, [state, isAuthenticated]); // Se ejecuta cada vez que el estado del carrito o la autenticación cambian.
  
  
    return (
      <CartContext.Provider value={{ state, dispatch }}>
        {children}
      </CartContext.Provider>
    );
};
    
export const useCart = () => {
      const context = useContext(CartContext);
      if (!context) {
        throw new Error('useCart debe ser usado dentro de CartProvider');
      }
      return context;
};