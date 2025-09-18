// src/pages/admin/Products.tsx
import React, { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import AddProductForm from './AddProductForm';

interface SizeStock {
  _id?: string;
  size: string;
  stock: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock?: number;
  category: string;
  image?: string;
  sizes: SizeStock[];
  createdAt?: string;
  updatedAt?: string;
}

const ProductsAdmin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // ✅ SOLUCIÓN CORRECTA PARA CREATE REACT APP
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Intentando cargar productos desde:', `${API_URL}/api/products`);
      
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

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`, {
          method: 'DELETE',
        });
        
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        
        setProducts(products.filter((p) => p._id !== id));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error('Error deleting product:', err);
        alert(`Error al eliminar producto: ${errorMessage}`);
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryIcons: { [key: string]: string } = {
      'ropa': '👕',
      'zapatos': '👟',
      'accesorios': '👜',
      'electronica': '📱',
      'hogar': '🏠',
      'deportes': '⚽',
      'libros': '📚',
      'juguetes': '🧸',
      'salud': '💊',
      'belleza': '💄'
    };
    return categoryIcons[category.toLowerCase()] || '👕';
  };

  const getStockStatus = (sizes: SizeStock[], stock?: number) => {
    if (Array.isArray(sizes) && sizes.length > 0) {
      const totalStock = sizes.reduce((sum, size) => sum + size.stock, 0);
      if (totalStock === 0) return { status: 'sin-stock', label: 'Sin Stock', color: 'red' };
      if (totalStock <= 10) return { status: 'bajo', label: 'Stock Bajo', color: 'amber' };
      return { status: 'bueno', label: 'En Stock', color: 'teal' };
    } else if (stock !== undefined) {
      if (stock === 0) return { status: 'sin-stock', label: 'Sin Stock', color: 'red' };
      if (stock <= 10) return { status: 'bajo', label: 'Stock Bajo', color: 'amber' };
      return { status: 'bueno', label: 'En Stock', color: 'teal' };
    }
    return { status: 'desconocido', label: 'N/A', color: 'gray' };
  };

  const getTotalStock = (product: Product) => {
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes.reduce((sum, size) => sum + size.stock, 0);
    }
    return product.stock || 0;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] p-6 flex items-center justify-center">
        <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 p-8 rounded-2xl shadow-lg border border-white/10 w-full max-w-md backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-red-500/20 rounded-full p-2">
              <svg className="w-6 h-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-red-200">Error al cargar</h2>
          </div>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={fetchProducts}
            className="w-full py-3 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-medium text-black bg-gradient-to-r from-[#60caba] to-[#FFD700] hover:from-[#58b7a9] hover:to-[#E6C600] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#60caba] transition-all duration-300"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] text-gray-200">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 p-6 mb-6 rounded-2xl shadow-lg border border-white/10 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent flex items-center gap-3">
                <div className="bg-gradient-to-r from-[#60caba]/80 to-[#FFD700]/80 p-3 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                Gestión de Productos
              </h1>
              <p className="text-gray-400 mt-1">Administra tu inventario de manera eficiente</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
                    viewMode === 'cards'
                      ? 'bg-white/10 shadow-md text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14-7H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z"></path>
                  </svg>
                  Tarjetas
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
                    viewMode === 'table'
                      ? 'bg-white/10 shadow-md text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  Tabla
                </button>
              </div>

              <div className="text-sm text-gray-400 bg-white/5 border border-white/10 px-3 py-2 rounded-lg">
                <span className="font-medium text-gray-300">Total:</span> {products.length} productos
              </div>
            </div>
          </div>
        </div>

        {/* Add Product Button */}
        <div className="mb-6">
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto flex justify-center py-3 px-6 border border-transparent rounded-2xl shadow-lg text-sm font-medium text-black bg-gradient-to-r from-[#60caba] to-[#FFD700] hover:from-[#58b7a9] hover:to-[#E6C600] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#60caba] transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <span>Agregar Nuevo Producto</span>
          </button>
        </div>

        {/* Products Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#60caba] mx-auto mb-4"></div>
              <div className="text-lg text-gray-400">Cargando productos...</div>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 p-12 rounded-2xl shadow-lg border border-white/10 text-center backdrop-blur-sm">
            <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <p className="text-gray-400 text-lg">No hay productos disponibles</p>
            <p className="text-gray-500 text-sm mt-2">Agrega el primer producto para comenzar</p>
          </div>
        ) : viewMode === 'cards' ? (
          // Cards View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const stockInfo = getStockStatus(product.sizes, product.stock);
              const totalStock = getTotalStock(product);
              
              return (
                <div key={product._id} className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 rounded-2xl shadow-lg border border-white/10 overflow-hidden 
                  transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#60caba]/20 hover:border-[#60caba]/50">
                  {/* Product Image */}
                  <div className="relative h-48 bg-white/5">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                    )}
                    
                    {/* Stock Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        stockInfo.color === 'teal' ? 'bg-teal-500/20 text-teal-300' :
                        stockInfo.color === 'amber' ? 'bg-amber-500/20 text-amber-300' :
                        stockInfo.color === 'red' ? 'bg-red-500/20 text-red-300' :
                        'bg-gray-500/20 text-gray-300'
                      } backdrop-blur-sm`}>
                        {stockInfo.label}
                      </span>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/40 backdrop-blur-sm text-gray-200 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <span>{getCategoryIcon(product.category)}</span>
                        <span>{product.category}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-100 text-lg line-clamp-2 mb-2 h-14">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-[#60caba]">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-sm text-gray-400">
                          Total: {totalStock}
                        </span>
                      </div>
                    </div>

                    {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {product.sizes.map((size) => (
                            <span
                              key={size._id || size.size}
                              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                                size.stock > 10 ? 'bg-teal-500/20 text-teal-300'
                                : size.stock > 0 ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-red-500/20 text-red-300'
                              }`}
                            >
                              {size.size}: {size.stock}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2 pt-4 border-t border-white/10">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center justify-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center justify-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Table View
          <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 rounded-2xl shadow-lg overflow-hidden border border-white/10 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">Producto</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">Precio</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {products.map((product) => {
                    const stockInfo = getStockStatus(product.sizes, product.stock);
                    const totalStock = getTotalStock(product);
                    
                    return (
                      <tr key={product._id} className="hover:bg-white/5 transition-colors duration-150">
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              {product.image ? (
                                <img src={product.image} alt={product.name} className="h-12 w-12 object-cover rounded-md shadow-sm ring-1 ring-white/10" />
                              ) : (
                                <div className="h-12 w-12 bg-white/5 rounded-md shadow-sm flex items-center justify-center">
                                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-100">{product.name}</div>
                               <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#60caba]/20 text-[#60caba]">
                                <span>{getCategoryIcon(product.category)}</span>
                                <span>{product.category}</span>
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-lg font-bold text-[#60caba]">
                            {formatPrice(product.price)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-200">Total: {totalStock}</div>
                            {product.createdAt && (<div className="text-gray-500">Creado: {formatDate(product.createdAt)}</div>)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            stockInfo.color === 'teal' ? 'bg-teal-500/20 text-teal-300' :
                            stockInfo.color === 'amber' ? 'bg-amber-500/20 text-amber-300' :
                            stockInfo.color === 'red' ? 'bg-red-500/20 text-red-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {stockInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center space-x-2">
                          <button onClick={() => handleEdit(product)} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors duration-200 transform hover:scale-105" title="Editar producto">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                          </button>
                          <button onClick={() => handleDelete(product._id)} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors duration-200 transform hover:scale-105" title="Eliminar producto">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
      >
        <AddProductForm 
          editingProduct={editingProduct} 
          onSuccess={handleModalClose} 
        />
      </Modal>
    </div>
  );
};

export default ProductsAdmin;