// src/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

// --- ✅ [CORRECCIÓN] Definimos y exportamos las nuevas interfaces aquí ---
export interface Size {
  _id?: string;
  size: string;
  stock: number;
}

export interface Variant {
  colorName: string;
  colorHex: string;
  images: string[];
  sizes: Size[];
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  reviewCount: number;
  // El campo 'variants' reemplaza a 'image' y 'sizes'
  variants: Variant[]; 
}
// -----------------------------------------------------------------

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
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