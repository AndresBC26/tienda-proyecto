import React, { useEffect, useState } from 'react';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
}

const ProductsAdmin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Manejo más robusto de la variable de entorno
  const getApiUrl = () => {
    // Verifica si import.meta.env existe
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.VITE_API_URL || 'http://localhost:5000';
    }
    
    // Fallback si import.meta no está disponible
    return process.env.REACT_APP_API_URL || 'http://localhost:5000';
  };

  const API_URL = getApiUrl();

  const fetchProducts = async () => {
    try {
      console.log('Usando API_URL:', API_URL);
      setError(null);
      
      const res = await fetch(`${API_URL}/api/products`);
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error fetching products:', error);
      setError(`Error al cargar productos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg">Cargando productos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={fetchProducts}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Productos (MongoDB Atlas)</h1>
        <div className="text-sm text-gray-600">
          API: {API_URL}
        </div>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay productos disponibles</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-3 text-left">Imagen</th>
                <th className="border border-gray-300 p-3 text-left">Nombre</th>
                <th className="border border-gray-300 p-3 text-left">Categoría</th>
                <th className="border border-gray-300 p-3 text-left">Precio</th>
                <th className="border border-gray-300 p-3 text-left">Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3">
                    {p.image ? (
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="h-12 w-12 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.jpg';
                        }}
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-xs">Sin img</span>
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-300 p-3 font-medium">{p.name}</td>
                  <td className="border border-gray-300 p-3">{p.category}</td>
                  <td className="border border-gray-300 p-3 font-semibold text-green-600">
                    ${p.price.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 p-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      p.stock > 10 ? 'bg-green-100 text-green-800' : 
                      p.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {p.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductsAdmin;