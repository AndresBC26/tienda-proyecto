// src/contexts/FavoritesContext.tsx
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Product } from '../hooks/useProducts';
import { useAuth } from './AuthContext';
import axios from 'axios';

// ✅ SOLUCIÓN CORRECTA PARA CREATE REACT APP
const API_URL = `${process.env.REACT_APP_API_URL}/api`;

// Definimos el estado de favoritos
interface FavoritesState {
  items: Product[];
  count: number;
}

// Definimos las acciones que podemos realizar
type FavoritesAction =
  | { type: 'SET_FAVORITES'; payload: Product[] }
  | { type: 'ADD_TO_FAVORITES'; payload: Product }
  | { type: 'REMOVE_FROM_FAVORITES'; payload: string }
  | { type: 'CLEAR_FAVORITES' };

const FavoritesContext = createContext<
  | {
      state: FavoritesState;
      dispatch: React.Dispatch<FavoritesAction>;
    }
  | undefined
>(undefined);

// El reducer maneja la lógica para agregar o eliminar favoritos
const favoritesReducer = (state: FavoritesState, action: FavoritesAction): FavoritesState => {
  switch (action.type) {
    case 'SET_FAVORITES': {
        const newItems = action.payload;
        return {
            items: newItems,
            count: newItems.length,
        };
    }
    case 'ADD_TO_FAVORITES': {
      const isAlreadyFavorite = state.items.some(item => item._id === action.payload._id);
      if (isAlreadyFavorite) {
        return state;
      }
      const newItems = [...state.items, action.payload];
      return {
        items: newItems,
        count: newItems.length,
      };
    }
    case 'REMOVE_FROM_FAVORITES': {
      const newItems = state.items.filter(item => item._id !== action.payload);
      return {
        items: newItems,
        count: newItems.length,
      };
    }
    case 'CLEAR_FAVORITES':
        return { items: [], count: 0 };
    default:
      return state;
  }
};

// Proveedor del contexto
export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [state, dispatch] = useReducer(favoritesReducer, {
    items: [],
    count: 0,
  });

  useEffect(() => {
    const fetchFavorites = async () => {
      if (isAuthenticated && user) {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_URL}/users/${user._id}/favorites`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          dispatch({ type: 'SET_FAVORITES', payload: res.data.favorites });
        } catch (error) {
          console.error("Error al cargar los favoritos del usuario:", error);
        }
      } else {
        dispatch({ type: 'CLEAR_FAVORITES' });
      }
    };
    fetchFavorites();
  }, [isAuthenticated, user]);

  const augmentedDispatch = async (action: FavoritesAction) => {
    const token = localStorage.getItem('token');
    if (isAuthenticated && user && token) {
      try {
        if (action.type === 'ADD_TO_FAVORITES') {
          await axios.post(`${API_URL}/users/${user._id}/favorites`, 
            { productId: action.payload._id },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        } else if (action.type === 'REMOVE_FROM_FAVORITES') {
          await axios.delete(`${API_URL}/users/${user._id}/favorites/${action.payload}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      } catch (error) {
        console.error("Error al actualizar favoritos en el servidor:", error);
        return;
      }
    }
    dispatch(action);
  };

  return (
    <FavoritesContext.Provider value={{ state, dispatch: augmentedDispatch as React.Dispatch<FavoritesAction> }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites debe ser usado dentro de un FavoritesProvider');
  }
  return context;
};