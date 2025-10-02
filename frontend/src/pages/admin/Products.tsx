// src/pages/admin/Products.tsx
import React, { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import AddProductForm from './AddProductForm';
import { Product } from '../../hooks/useProducts';
import { useNotification } from '../../contexts/NotificationContext';
import toast, { Toast } from 'react-hot-toast';
import axios from 'axios';

const ProductsAdmin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { notify } = useNotification();
  
  const [editingCell, setEditingCell] = useState<{ id: string; field: 'price' } | null>(null);
  const [editValue, setEditValue] = useState<string | number>('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/products`);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(`Error al cargar productos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleConfirmDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo eliminar el producto');
      
      setProducts(products.filter((p) => p._id !== id));
      notify('Producto eliminado exitosamente', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      notify(`Error al eliminar el producto: ${errorMessage}`, 'error');
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    notify(
      (t: Toast) => (
        <div className="text-white p-2">
          <p className="font-bold mb-2">¿Confirmas la eliminación?</p>
          <p className="text-sm text-gray-400 mb-4">El producto será borrado permanentemente.</p>
          <div className="flex gap-3">
            <button
              onClick={() => { toast.dismiss(t.id); handleConfirmDelete(id); }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg text-sm"
            >
              Eliminar
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      ), 'info', { duration: 6000 }
    );
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

  const handleDoubleClick = (e: React.MouseEvent, id: string, field: 'price', value: number) => {
    e.stopPropagation();
    setEditingCell({ id, field });
    setEditValue(value);
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;
    
    const productToUpdate = products.find(p => p._id === editingCell.id);
    if (!productToUpdate || productToUpdate.price === editValue) {
        setEditingCell(null);
        return;
    }

    const updatedProductData = { ...productToUpdate, price: Number(editValue) };
    const data = new FormData();
    data.append('name', updatedProductData.name);
    data.append('description', updatedProductData.description);
    data.append('price', updatedProductData.price.toString());
    data.append('category', updatedProductData.category);
    data.append('variants', JSON.stringify(updatedProductData.variants.map(v => ({...v, images: v.images}))));

    const token = localStorage.getItem('token');
    try {
        await axios.put(`${API_URL}/api/products/${editingCell.id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
        });
        notify('Precio actualizado!', 'success');
        fetchProducts();
    } catch (err) {
        notify('Error al actualizar el precio', 'error');
    } finally {
        setEditingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSaveEdit();
    else if (e.key === 'Escape') setEditingCell(null);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
  const getTotalStock = (product: Product): number => product.variants.reduce((sum, variant) => sum + variant.sizes.reduce((s, size) => s + size.stock, 0), 0);
  const getStockStatus = (product: Product) => {
    const totalStock = getTotalStock(product);
    if (totalStock === 0) return { label: 'Sin Stock', status: 'error' };
    if (totalStock <= 10) return { label: 'Stock Bajo', status: 'warning' };
    return { label: 'En Stock', status: 'success' };
  };
  
  const getCategoryIcon = (category?: string) => '👕';

  if (error) return <div className="p-6 text-red-400">Error: {error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 p-6 mb-6 rounded-2xl shadow-lg border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#60caba]/80 to-[#FFD700]/80 p-3 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
              </div>
              Gestión de Productos
            </h1>
            <p className="text-gray-400 mt-1">Administra tu inventario de manera eficiente</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              <button onClick={() => setViewMode('cards')} className={`px-3 py-2 rounded-md transition-all text-sm font-medium ${viewMode === 'cards' ? 'bg-white/10 shadow-md text-white' : 'text-gray-400 hover:text-white'}`}>Tarjetas</button>
              <button onClick={() => setViewMode('table')} className={`px-3 py-2 rounded-md transition-all text-sm font-medium ${viewMode === 'table' ? 'bg-white/10 shadow-md text-white' : 'text-gray-400 hover:text-white'}`}>Tabla</button>
            </div>
            <div className="text-sm text-gray-400 bg-white/5 border border-white/10 px-3 py-2 rounded-lg"><span className="font-medium text-gray-300">Total:</span> {products.length} productos</div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <button onClick={openAddModal} className="text-black bg-gradient-to-r from-[#60caba] to-[#FFD700] hover:from-[#58b7a9] hover:to-[#E6C600] font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          <span>Agregar Nuevo Producto</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#60caba] mx-auto mb-4"></div><div className="text-lg text-gray-400">Cargando productos...</div></div>
      ) : products.length === 0 ? (
        <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 p-12 rounded-2xl shadow-lg border border-white/10 text-center backdrop-blur-sm"><p className="text-gray-400 text-lg">No hay productos disponibles</p></div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const stockInfo = getStockStatus(product);
            const totalStock = getTotalStock(product);
            const firstImage = product.variants?.[0]?.images?.[0] || '/placeholder-image.jpg';
            const badgeClasses = { error: 'bg-red-500/20 text-red-300', warning: 'bg-amber-500/20 text-amber-300', success: 'bg-teal-500/20 text-teal-300' };
            const formattedCategory = product.category.replace(/camiseta(s)?/i, '').trim();
            return (
              <div 
                key={product._id} 
                className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 rounded-2xl shadow-lg border border-white/10 p-5 flex flex-col justify-between
                transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#60caba]/20 hover:border-[#60caba]/50 cursor-pointer"
                onClick={() => handleEdit(product)}
              >
                <div>
                  <div className="relative h-48"><img src={firstImage} alt={product.name} className="w-full h-full object-cover rounded-lg" /></div>
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    {/* ===== INICIO DE LA CORRECCIÓN ===== */}
                    <span className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 capitalize">
                      <span className="transform -translate-y-px">{getCategoryIcon(product.category)}</span>
                      {formattedCategory}
                    </span>
                    {/* ===== FIN DE LA CORRECCIÓN ===== */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClasses[stockInfo.status as keyof typeof badgeClasses]}`}>{stockInfo.label}</span>
                  </div>
                  <h3 className="font-bold text-gray-100 text-lg truncate mt-3">{product.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xl font-bold text-[#60caba]">{formatPrice(product.price)}</span>
                    <span className="text-sm text-gray-400">Stock: {totalStock}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 h-10 overflow-hidden">{product.description}</p>
                </div>
                <div className="flex space-x-2 pt-4 border-t border-white/10 mt-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(product); }} 
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg transition-colors text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, product._id)} 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg transition-colors text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 rounded-2xl shadow-lg overflow-hidden border border-white/10 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">Producto</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">Categoría</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">Precio</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">Stock Total</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {products.map((product) => {
                  const stockInfo = getStockStatus(product);
                  const totalStock = getTotalStock(product);
                  const firstImage = product.variants?.[0]?.images?.[0] || '/placeholder-image.jpg';
                  const badgeClasses = { error: 'bg-red-500/20 text-red-300', warning: 'bg-amber-500/20 text-amber-300', success: 'bg-teal-500/20 text-teal-300' };
                  const formattedCategory = product.category.replace(/camiseta(s)?/i, '').trim();
                  return (
                    <tr 
                        key={product._id} 
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => handleEdit(product)}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <img src={firstImage} alt={product.name} className="h-12 w-12 object-cover rounded-md" />
                          <div className="font-medium text-gray-100">{product.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-300 capitalize">{formattedCategory}</td>
                      <td 
                        className="px-4 py-4 font-bold text-[#60caba]"
                        onDoubleClick={(e) => handleDoubleClick(e, product._id, 'price', product.price)}
                      >
                        {editingCell?.id === product._id && editingCell?.field === 'price' ? (
                            <input 
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(Number(e.target.value))}
                                onBlur={handleSaveEdit}
                                onKeyDown={handleKeyDown}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                                className="bg-black/50 border border-[#60caba] rounded-md px-2 py-1 w-28"
                            />
                        ) : (
                            formatPrice(product.price)
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-300">{totalStock}</td>
                      <td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClasses[stockInfo.status as keyof typeof badgeClasses]}`}>{stockInfo.label}</span></td>
                      <td className="px-4 py-4 text-center space-x-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(product); }} 
                            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button 
                            onClick={(e) => handleDelete(e, product._id)} 
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

      <Modal isOpen={isModalOpen} onClose={handleModalClose} title={editingProduct ? "Editar Producto" : "Agregar Nuevo Producto"}>
        <AddProductForm editingProduct={editingProduct} onSuccess={handleModalClose} />
      </Modal>
    </div>
  );
};

export default ProductsAdmin;