// src/components/shop/Product-card.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product, Size, Variant } from '../../hooks/useProducts'; // Asegúrate de importar Size y Variant
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import { brandConfig } from '../../utils/brandConfig';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const { state: favoritesState, dispatch: favoritesDispatch } = useFavorites();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isFavorite = favoritesState.items.some(item => item._id === product._id);
  const [pulse, setPulse] = useState(false);

  // --- ✅ [CORRECCIÓN] Lógica de stock adaptada para variantes ---
  const totalStock = product.variants.reduce((sum, variant) => 
    sum + variant.sizes.reduce((s, size) => s + size.stock, 0), 0);
  
  const isOutOfStock = totalStock === 0;
  
  const totalQuantityInCart = cartState.items
    .filter(item => item._id === product._id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const isLimitReached = totalQuantityInCart >= totalStock;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLimitReached || isOutOfStock) return;

    // --- ✅ [CORRECCIÓN] Lógica para encontrar la primera variante y talla disponible ---
    let firstAvailable: { variant: Variant; size: Size } | null = null;

    for (const variant of product.variants) {
      for (const size of variant.sizes) {
        const itemInCart = cartState.items.find(
          item => item.cartItemId === `${product._id}-${variant.colorName}-${size.size}`
        );
        const quantityInCart = itemInCart ? itemInCart.quantity : 0;
        if (quantityInCart < size.stock) {
          firstAvailable = { variant, size };
          break;
        }
      }
      if (firstAvailable) break;
    }

    if (firstAvailable) {
      cartDispatch({
        type: 'ADD_PRODUCTS_TO_CART',
        payload: {
          product,
          quantity: 1,
          size: firstAvailable.size.size,
          color: firstAvailable.variant.colorName,
          image: firstAvailable.variant.images[0] || '',
        },
      });
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isFavorite) {
      favoritesDispatch({ type: 'REMOVE_FROM_FAVORITES', payload: product._id });
    } else {
      favoritesDispatch({ type: 'ADD_TO_FAVORITES', payload: product });
    }
  };

  const renderStars = (rating: number) => {
    if (isNaN(rating) || rating < 0) rating = 0;
    const filledStars = Math.floor(rating);
    const starElements = [];
  
    for (let i = 0; i < filledStars; i++) {
      starElements.push(<svg key={`filled-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
    }
  
    for (let i = filledStars; i < 5; i++) {
      starElements.push(<svg key={`empty-${i}`} className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
    }
  
    return <div className="flex items-center">{starElements}</div>;
  };
  
  const discountPercentage = (brandConfig.business.discountPercentage || 0.10) * 100;
  const originalPrice = product.price / (1 - (brandConfig.business.discountPercentage || 0.10));

  // --- ✅ [CORRECCIÓN] Usa la primera imagen de la primera variante ---
  const displayImage = product.variants?.[0]?.images?.[0] || 'https://via.placeholder.com/400';

  return (
    <Link 
      to={`/product/${product._id}`} 
      className="group block bg-[#151515]/80 backdrop-blur-sm border border-white/10 rounded-3xl shadow-2xl shadow-black/30 hover:shadow-black/40 transition-all duration-300 overflow-hidden transform hover:-translate-y-1.5 flex flex-col h-full max-w-sm mx-auto"
      >
      <div className="relative overflow-hidden">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        <button
          onClick={handleToggleFavorite}
          className={`absolute bottom-3 right-3 w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-10 ${
            isFavorite ? 'bg-red-500/80 text-white' : 'bg-black/50 text-white hover:text-red-400'
          }`}
        >
          <svg className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </button>
      </div>

      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
              {product.category}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isOutOfStock
                  ? 'bg-red-500/20 text-red-300'
                  : totalStock <= 10
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-[#60caba]/20 text-[#60caba]'
              }`}
            >
              {isOutOfStock
                ? 'Agotado'
                : `${totalStock} ${totalStock === 1 ? 'Disponible' : 'Disponibles'}`
              }
            </span>
          </div>

          <h3 className="text-lg font-bold text-gray-100 mb-1 line-clamp-2 group-hover:text-[#FFD700] transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center space-x-2 mb-2">
            {renderStars(product.rating)}
            <span className="text-xs text-gray-400">({product.reviewCount} reseñas)</span>
          </div>

          <div className="flex items-baseline space-x-2 mb-4">
            <span className="text-xl font-bold text-white">${product.price.toLocaleString()}</span>
            <span className="text-sm text-gray-500 line-through">${originalPrice.toLocaleString('es-CO', {maximumFractionDigits: 0})}</span>
            <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-xs font-bold">-{discountPercentage}%</span>
          </div>
        </div>

        <div className="mt-auto pt-2">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isLimitReached}
            className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 text-sm ${
              isOutOfStock || isLimitReached
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : `bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black shadow-lg shadow-[#60caba44] hover:from-[#58b7a9] hover:to-[#E6C600] transform hover:scale-105 ${pulse ? 'animate-pulse' : ''}`
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5.4M7 13l-1.5 4H19m-10-4v6a2 2 0 104 0v-6m-4 0h4" /></svg>
            <span>
              {isOutOfStock ? 'Agotado' : isLimitReached ? 'Límite en Carrito' : 'Agregar al Carrito'}
            </span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;