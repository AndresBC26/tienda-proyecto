// src/components/product/ProductImageGallery.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  onImageChange?: (index: number) => void;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ 
  images, 
  productName,
  onImageChange 
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Agregar estado para controlar el montaje del portal
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Manejar selección de imagen
  const handleImageSelect = useCallback((index: number) => {
    setSelectedIndex(index);
    onImageChange?.(index);
  }, [onImageChange]);

  // Manejar zoom en imagen
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZooming) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  }, [isZooming]);

  // Navegación con teclado en lightbox
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isLightboxOpen) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        setSelectedIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
        break;
      case 'ArrowRight':
        setSelectedIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
        break;
      case 'Escape':
        setIsLightboxOpen(false);
        break;
    }
  }, [isLightboxOpen, images.length]);

  // Agregar/remover event listeners y manejar overflow del body
  useEffect(() => {
    if (isLightboxOpen) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen, handleKeyPress]);

  return (
    <>
      <div className="space-y-4">
        
        {/* IMAGEN PRINCIPAL */}
        <div className="relative bg-white rounded-3xl shadow-lg overflow-hidden aspect-square group">
          <div
            className="relative w-full h-full cursor-zoom-in"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setIsLightboxOpen(true)}
          >
            <img
              src={images[selectedIndex]}
              alt={`${productName} - Vista ${selectedIndex + 1}`}
              className={`w-full h-full object-cover transition-all duration-500 ${
                isZooming ? 'scale-150' : 'scale-100'
              }`}
              style={isZooming ? {
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
              } : {}}
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Imagen+No+Disponible';
              }}
            />
            
            {/* OVERLAY DE ZOOM */}
            <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
              isZooming ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-2 text-sm font-medium text-gray-700">
                <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Click para ampliar
              </div>
            </div>

            {/* NAVEGACIÓN EN IMAGEN PRINCIPAL */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageSelect(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageSelect(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* INDICADOR DE IMAGEN */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>

        {/* MINIATURAS */}
        {images.length > 1 && (
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleImageSelect(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                  selectedIndex === index 
                    ? 'border-[#5FCDD9] shadow-lg ring-2 ring-[#5FCDD9]/30' 
                    : 'border-gray-200 hover:border-[#04BFAD]'
                }`}
              >
                <img
                  src={image}
                  alt={`Vista ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/150x150?text=N/A';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      {isLightboxOpen && isMounted && ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          
          {/* BOTÓN CERRAR */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200 flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* IMAGEN PRINCIPAL EN LIGHTBOX */}
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <img
              src={images[selectedIndex]}
              alt={`${productName} - Vista ${selectedIndex + 1}`}
              className="w-full h-full object-contain"
            />

            {/* NAVEGACIÓN EN LIGHTBOX */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => handleImageSelect(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200 flex items-center justify-center"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleImageSelect(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200 flex items-center justify-center"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* INDICADORES EN LIGHTBOX */}
          {images.length > 1 && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageSelect(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      selectedIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
              <div className="text-white text-center mt-2 text-sm">
                {selectedIndex + 1} / {images.length} • Usa las flechas del teclado para navegar
              </div>
            </div>
          )}

          {/* ÁREA CLICKEABLE PARA CERRAR */}
          <div
            className="absolute inset-0 -z-10"
            onClick={() => setIsLightboxOpen(false)}
          />
        </div>,
        document.getElementById('modal-root')!
      )}
    </>
  );
};

export default ProductImageGallery;