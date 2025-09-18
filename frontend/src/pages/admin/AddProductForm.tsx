// src/pages/admin/AddProductForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../contexts/NotificationContext'; // <-- IMPORTADO

interface Size {
  size: string;
  stock: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: Size[];
  image?: string;
}

interface Props {
  editingProduct?: Product | null;
  onSuccess: () => void;
}

const AddProductForm: React.FC<Props> = ({ editingProduct, onSuccess }) => {
  const { notify } = useNotification(); // <-- HOOK EN USO
  const [formData, setFormData] = useState<Omit<Product, '_id'>>({
    name: '',
    description: '',
    price: 0,
    category: 'Camisetas',
    sizes: [],
    image: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        category: editingProduct.category,
        sizes: editingProduct.sizes || [],
        image: editingProduct.image || ''
      });
      setImageUrl(editingProduct.image || '');
      setImagePreview(editingProduct.image || '');
      setImageFile(null);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'Camisetas',
        sizes: [],
        image: ''
      });
      setImageUrl('');
      setImagePreview('');
      setImageFile(null);
    }
  }, [editingProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setImageFile(file);
    setImageUrl('');
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setImageFile(null);
    setImagePreview(url);
  };

  const handleSizeChange = (index: number, field: keyof Size, value: string) => {
    const newSizes = [...formData.sizes];
    if (field === 'stock') {
      newSizes[index][field] = parseInt(value) || 0;
    } else {
      newSizes[index][field] = value;
    }
    setFormData(prev => ({ ...prev, sizes: newSizes }));
  };

  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: '', stock: 0 }],
    }));
  };

  const removeSize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price.toString());
    data.append('category', formData.category);
    data.append('sizes', JSON.stringify(formData.sizes));

    if (imageFile) {
      data.append('imageFile', imageFile);
    } else if (imageUrl) {
      data.append('image', imageUrl);
    }

    try {
      if (editingProduct) {
        await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        notify('✅ Producto actualizado exitosamente!', 'success');
      } else {
        await axios.post('http://localhost:5000/api/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        notify('✅ Producto agregado exitosamente!', 'success');
      }
      setTimeout(() => { onSuccess(); }, 1500);
    } catch (err: any) {
      notify(`❌ Error: ${err.response?.data?.message || err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-gray-200">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-6">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Producto</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba]" placeholder="Ej: Camiseta Premium..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} required className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba] resize-none" placeholder="Describe el producto..."/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Precio</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" required className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
              <select name="category" value={formData.category} onChange={handleChange} required className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#60caba]">
                <option className="bg-[#151515]" value="Camisetas">Camisetas</option>
                <option className="bg-[#151515]" value="Camisetas Overzide">Camisetas Overzide</option>
                <option className="bg-[#151515]" value="Camisetas Basicas">Camisetas Basicas</option>
                <option className="bg-[#151515]" value="Camisetas Estampadas">Camisetas Estampadas</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-6">Imagen del Producto</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subir o arrastrar archivo</label>
                  <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`relative border-2 border-dashed rounded-xl transition-colors ${dragActive ? 'border-[#60caba] bg-teal-900/20' : 'border-white/20'}`}>
                      <input type="file" onChange={handleImageChange} accept="image/*" className="hidden" id="file-upload-dark" />
                      <label htmlFor="file-upload-dark" className="flex flex-col items-center justify-center w-full py-8 cursor-pointer"><p className="text-gray-400">Arrastra una imagen o haz clic</p></label>
                  </div>
                  <p className="text-center text-gray-400 my-4">o</p>
                  <label className="block text-sm font-medium text-gray-300 mb-2">URL de la imagen</label>
                  <input type="url" placeholder="https://..." value={imageUrl} onChange={handleImageUrlChange} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba]" />
                </div>
                <div className="bg-black/20 rounded-xl p-4 h-64 flex items-center justify-center border border-white/10">
                    {imagePreview ? <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg" onError={() => setImagePreview('')} /> : <p className="text-gray-500">Vista previa</p>}
                </div>
            </div>
        </div>

        <div className="bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-100">Tallas y Stock</h2>
            <button type="button" onClick={addSize} className="bg-[#60caba] text-black font-bold px-4 py-2 rounded-lg hover:bg-[#58b7a9] transition-colors">Añadir Talla</button>
          </div>
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {formData.sizes.length === 0 ? (
                <div className="text-center py-8 bg-black/20 rounded-xl border-2 border-dashed border-white/10"><p className="text-gray-500">No hay tallas configuradas</p><p className="text-gray-600 text-sm">Haz clic en "Añadir Talla" para comenzar</p></div>
            ) : formData.sizes.map((size, index) => (
              <div key={index} className="flex items-center gap-4 bg-black/20 p-3 rounded-lg border border-white/10">
                <input type="text" placeholder="Talla (S, M...)" value={size.size} onChange={(e) => handleSizeChange(index, 'size', e.target.value)} required className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#60caba]" />
                <input type="number" placeholder="Stock" value={size.stock} onChange={(e) => handleSizeChange(index, 'stock', e.target.value)} required min="0" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#60caba]" />
                <button type="button" onClick={() => removeSize(index)} className="bg-red-500/20 text-red-300 p-2 rounded-lg hover:bg-red-500/30 transition-colors">Eliminar</button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button type="submit" disabled={loading} className="w-full max-w-xs justify-center flex items-center gap-3 py-4 px-4 border border-transparent rounded-2xl shadow-lg text-lg font-medium text-black bg-gradient-to-r from-[#60caba] to-[#FFD700] hover:from-[#58b7a9] hover:to-[#E6C600] disabled:opacity-50 transition-all transform hover:scale-105">
            {loading ? 'Guardando...' : editingProduct ? 'Guardar Cambios' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;