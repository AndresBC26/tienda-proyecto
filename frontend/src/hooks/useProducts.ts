// src/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Size { _id?: string; size: string; stock: number; }
export interface Product { _id: string; name: string; description: string; price: number; category: string; image: string; stock?: number; rating: number; reviewCount: number; sizes: Size[]; }

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // ✅ SOLUCIÓN: Se añade una URL de respaldo para el entorno de desarrollo.
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        
        const response = await axios.get(`${apiUrl}/api/products`);
        setProducts(response.data);
        setError(null);
      } catch (err: any) {
        setError("No se pudieron cargar los productos. Asegúrate de que el backend está corriendo.");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};