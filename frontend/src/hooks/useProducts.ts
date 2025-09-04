import { useState, useEffect } from 'react';
import api from '../utils/api';

// Definimos la estructura de un producto
export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
  rating: number;
  reviewCount: number;
}

// Custom hook para manejar productos
export const useProducts = () => {
  // Estados para productos, carga y errores
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener productos del backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
      setError(null); // Limpiar errores previos
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Error obteniendo productos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Ejecutar al cargar el hook
  useEffect(() => {
    fetchProducts();
  }, []);

  // Retornar estados y funciones
  return {
    products, // Lista de productos
    loading, // Si está cargando
    error, // Si hay error
    refetch: fetchProducts, // Función para recargar
  };
};
