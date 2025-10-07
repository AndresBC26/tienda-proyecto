// src/pages/admin/AddProductForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNotification } from '../../contexts/NotificationContext';
import { Product as ProductWithVariants } from '../../hooks/useProducts';

// --- INTERFACES Y TIPOS ---
interface Props {
  editingProduct?: ProductWithVariants | null;
  onSuccess: () => void;
}

type Variant = ProductWithVariants['variants'][0];
type Size = Variant['sizes'][0];

type ImageSource = { type: 'url', value: string } | { type: 'file', value: File, preview: string };

const AddProductForm: React.FC<Props> = ({ editingProduct, onSuccess }) => {
  const { notify } = useNotification();
  
  const [formData, setFormData] = useState<Omit<ProductWithVariants, '_id' | 'variants' | 'rating' | 'reviewCount'> & { variants: (Omit<Variant, 'images'> & { images: ImageSource[] })[] }>({
    name: '',
    description: '',
    price: 0,
    category: 'Camisetas Oversize',
    variants: [],
  });

  const [loading, setLoading] = useState(false);
  
  const dragImage = useRef<number | null>(null);
  const dragOverImage = useRef<number | null>(null);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        category: editingProduct.category,
        variants: editingProduct.variants.map(v => ({
          ...v,
          images: v.images.map(url => ({ type: 'url', value: url }))
        }))
      });
    } else {
      setFormData({ name: '', description: '', price: 0, category: 'Camisetas Oversize', variants: [] });
    }
  }, [editingProduct]);

  // --- MANEJADORES BÁSICOS (sin cambios) ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
  };
  const addVariant = () => setFormData(prev => ({ ...prev, variants: [...prev.variants, { colorName: '', colorHex: '#ffffff', images: [], sizes: [] }] }));
  const removeVariant = (variantIndex: number) => setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== variantIndex) }));
  const handleVariantChange = (variantIndex: number, field: keyof Variant, value: any) => {
    const newVariants = [...formData.variants];
    (newVariants[variantIndex] as any)[field] = value;
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };
  const addSize = (variantIndex: number) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].sizes.push({ size: '', stock: 0 });
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };
  const removeSize = (variantIndex: number, sizeIndex: number) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].sizes = newVariants[variantIndex].sizes.filter((_, i) => i !== sizeIndex);
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };
  const handleSizeChange = (variantIndex: number, sizeIndex: number, field: keyof Size, value: string) => {
    const newVariants = [...formData.variants];
    const newSizes = [...newVariants[variantIndex].sizes];
    newSizes[sizeIndex] = { ...newSizes[sizeIndex], [field]: field === 'stock' ? parseInt(value) || 0 : value };
    newVariants[variantIndex].sizes = newSizes;
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  // --- MANEJADORES DE IMÁGENES (sin cambios) ---
  const handleImageFilesChange = (variantIndex: number, files: FileList) => {
    const newImageFiles = Array.from(files).map(file => ({
      type: 'file' as 'file',
      value: file,
      preview: URL.createObjectURL(file)
    }));
    const newVariants = [...formData.variants];
    newVariants[variantIndex].images.push(...newImageFiles);
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const removeImage = (variantIndex: number, imageIndex: number) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].images = newVariants[variantIndex].images.filter((_, i) => i !== imageIndex);
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };
  
  const handleSortImages = (variantIndex: number) => {
    if (dragImage.current === null || dragOverImage.current === null) return;
    
    const newVariants = [...formData.variants];
    const variantToUpdate = newVariants[variantIndex];
    const reorderedImages = [...variantToUpdate.images];
    const draggedImageContent = reorderedImages.splice(dragImage.current, 1)[0];
    reorderedImages.splice(dragOverImage.current, 0, draggedImageContent);
    newVariants[variantIndex] = { ...variantToUpdate, images: reorderedImages };
    
    dragImage.current = null;
    dragOverImage.current = null;
    
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  // --- ENVÍO DEL FORMULARIO ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price.toString());
    data.append('category', formData.category);

    // ========================================================================
    // =====           ✅ INICIO DE LA CORRECCIÓN DEFINITIVA ✅           =====
    // ========================================================================
    // El error 500 se producía aquí. Al usar `{ ...variant }`, se podían colar
    // datos complejos (como el objeto File) en el JSON, lo que rompía el backend.
    //
    // La solución es construir un objeto limpio manualmente, asegurando que solo
    // enviamos los datos que el backend espera (strings, números, etc.).
    const variantsForBackend = formData.variants.map(variant => {
      const imagePlaceholdersOrUrls = variant.images.map(img => {
        if (img.type === 'file') {
          data.append('imageFiles', img.value);
          return editingProduct ? 'new_file_placeholder' : 'placeholder';
        }
        return img.value;
      });

      // Se crea un objeto "limpio" solo con las propiedades necesarias.
      // También se limpian las tallas para quitar el `_id` que añade Mongoose.
      const cleanSizes = variant.sizes.map(({ size, stock }) => ({ size, stock }));

      return {
        colorName: variant.colorName,
        colorHex: variant.colorHex,
        sizes: cleanSizes,
        images: imagePlaceholdersOrUrls,
      };
    });
    // ========================================================================
    // =====            ✅ FIN DE LA CORRECCIÓN DEFINITIVA ✅            =====
    // ========================================================================

    data.append('variants', JSON.stringify(variantsForBackend));

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');
    
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      if (editingProduct) {
        await axios.put(`${API_URL}/api/products/${editingProduct._id}`, data, { headers });
        notify('Producto actualizado exitosamente!', 'success');
      } else {
        await axios.post(`${API_URL}/api/products`, data, { headers });
        notify('Producto agregado exitosamente!', 'success');
      }
      setTimeout(() => onSuccess(), 1500);
    } catch (err: any) {
      notify(`❌ Error: ${err.response?.data?.message || err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-gray-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-[#60caba]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Información Básica
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Producto</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required 
                     className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-100" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} required 
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-100 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Precio</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" required 
                     className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
              <select name="category" value={formData.category} onChange={handleChange} required 
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-100 capitalize">
                <option className="bg-[#151515]" value="Camisetas Oversize">Oversize</option>
                <option className="bg-[#151515]" value="Camisetas Basicas">Basicas</option>
                <option className="bg-[#151515]" value="Camisetas Estampadas">Estampadas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sección de Variantes */}
        <div className="space-y-4">
            {formData.variants.map((variant, variantIndex) => (
                <div key={variantIndex} className="bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">Variante de Color #{variantIndex + 1}</h3>
                        <button type="button" onClick={() => removeVariant(variantIndex)} className="bg-red-500/20 text-red-300 px-3 py-1 rounded-lg">Eliminar</button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Color</label>
                          <input type="text" value={variant.colorName} onChange={(e) => handleVariantChange(variantIndex, 'colorName', e.target.value)} required className="w-full px-4 py-3 bg-white/10 rounded-xl" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Hex</label>
                          <input type="color" value={variant.colorHex} onChange={(e) => handleVariantChange(variantIndex, 'colorHex', e.target.value)} className="w-14 h-12 p-1 bg-white/10 rounded-xl" />
                        </div>
                    </div>
                    
                    {/* SECCIÓN DE IMÁGENES CON DRAG & DROP */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Imágenes de la Variante (Arrastra para reordenar)</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-3">
                          {variant.images.map((img, imgIndex) => (
                            <div 
                                key={imgIndex} 
                                className="relative group aspect-square cursor-grab"
                                draggable
                                onDragStart={() => (dragImage.current = imgIndex)}
                                onDragEnter={() => (dragOverImage.current = imgIndex)}
                                onDragEnd={() => handleSortImages(variantIndex)}
                                onDragOver={(e) => e.preventDefault()}
                            >
                              <img src={img.type === 'url' ? img.value : img.preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                              <button type="button" onClick={() => removeImage(variantIndex, imgIndex)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                            </div>
                          ))}
                        </div>
                        <input type="file" multiple onChange={(e) => e.target.files && handleImageFilesChange(variantIndex, e.target.files)} accept="image/*" 
                               className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white/10 file:text-gray-200 hover:file:bg-white/20" />
                    </div>
                    
                    {/* Tallas y Stock */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-md font-semibold text-gray-200">Tallas y Stock</h4>
                            <button type="button" onClick={() => addSize(variantIndex)} className="bg-white/10 text-gray-200 px-3 py-1 rounded-lg text-sm">Añadir Talla</button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                          {variant.sizes.map((size, sizeIndex) => (
                              <div key={sizeIndex} className="flex items-center gap-2 bg-black/10 p-2 rounded-lg">
                                  <input type="text" placeholder="Talla (S, M...)" value={size.size} onChange={(e) => handleSizeChange(variantIndex, sizeIndex, 'size', e.target.value)} required className="flex-1 px-3 py-2 bg-white/5 rounded-lg" />
                                  <input type="number" placeholder="Stock" value={size.stock} onChange={(e) => handleSizeChange(variantIndex, sizeIndex, 'stock', e.target.value)} required min="0" className="w-24 px-3 py-2 bg-white/5 rounded-lg" />
                                  <button type="button" onClick={() => removeSize(variantIndex, sizeIndex)} className="bg-red-500/20 text-red-300 p-2 rounded-lg">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                              </div>
                          ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <button type="button" onClick={addVariant} className="w-full py-4 border-2 border-dashed border-[#60caba]/50 rounded-2xl text-[#60caba]">Agregar Variante de Color</button>

        <div className="flex justify-center pt-4">
          <button type="submit" disabled={loading} className="w-full max-w-xs justify-center flex items-center gap-3 py-4 px-4 rounded-2xl text-lg font-medium text-black bg-gradient-to-r from-[#60caba] to-[#FFD700]">
            {loading ? 'Guardando...' : editingProduct ? 'Guardar Cambios' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;