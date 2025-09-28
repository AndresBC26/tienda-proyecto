// src/contexts/CartContext.tsx
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Product, Variant } from '../hooks/useProducts'; // ✅ Importar Variant
import { useAuth } from './AuthContext';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

// --- ✅ [MEJORA] CartItem ahora incluye las propiedades de la variante ---
export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string; // Color seleccionado
  image: string;         // Imagen de la variante específica
  cartItemId: string;    // ID único para la combinación producto-color-talla
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// --- ✅ [MEJORA] La acción de añadir al carrito ahora requiere más detalles ---
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

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newItems: CartItem[] = [...state.items];
  switch (action.type) {
    case 'SET_CART':
      newItems = action.payload;
      break;
    case 'ADD_PRODUCTS_TO_CART': {
      // --- ✅ [CORRECCIÓN] Lógica adaptada para manejar variantes de color ---
      const { product, quantity, size, color, image } = action.payload;
      // El ID único ahora incluye el color para diferenciar, ej: "producto1-Rojo-M"
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

        // --- ✅ [CORRECCIÓN] Busca el stock basado en la variante correcta ---
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

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated, user, setCartDispatch } = useAuth();
    const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0, itemCount: 0 });
  
    useEffect(() => {
      if (setCartDispatch) {
          setCartDispatch(dispatch);
      }
    }, [setCartDispatch]);
  
    // Nota: Las funciones `fetchCart` y `syncCart` necesitarán ajustes en el backend
    // para poder guardar y recuperar `selectedColor` y la `image` de la variante.
    // Por ahora, la lógica del frontend está corregida.
  
    useEffect(() => {
      const fetchCart = async () => {
        if (isAuthenticated && user) {
          try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/users/${user._id}/cart`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const cartFromDB = res.data.cart.map((item: any) => ({
                ...item.product,
                quantity: item.quantity,
                selectedSize: item.selectedSize,
                selectedColor: item.selectedColor || '', // Añadir fallback por si datos antiguos no lo tienen
                image: item.image || item.product?.variants[0]?.images[0], // Añadir fallback
                cartItemId: `${item.product._id}-${item.selectedColor}-${item.selectedSize}`
            }));
            dispatch({ type: 'SET_CART', payload: cartFromDB });
          } catch (error) {
            console.error("Error al cargar el carrito del usuario:", error);
          }
        } else {
          dispatch({ type: 'CLEAR_CART' });
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
                      selectedColor: item.selectedColor, // Enviar color
                      image: item.image, // Enviar imagen específica
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
      // Sincroniza solo si el estado ha cambiado para evitar llamadas innecesarias
      if (state.items.length > 0 || (isAuthenticated && state.items.length === 0)) {
          syncCart();
      }
    }, [state.items, isAuthenticated, user]);
  
  
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