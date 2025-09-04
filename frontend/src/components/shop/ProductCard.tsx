// src/components/shop/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../hooks/useProducts';
import { useCart } from '../../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { dispatch } = useCart();

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_TO_CART', payload: product });

    const button = document.getElementById(`add-btn-${product.id}`);
    if (button) {
      button.classList.add('animate-pulse');
      setTimeout(() => button.classList.remove('animate-pulse'), 600);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-[#5FCDD9] fill-current' : 'text-gray-300 fill-current'
        }`}
        viewBox="0 0 20 20"
      >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    ));
  };

  return (
    <div className="group bg-gradient-to-br from-[#ffffff] via-[#E6FBF9] to-[#D9F7F5] rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 border border-[#5FCDD9]/30">
      
      {/* IMAGEN DEL PRODUCTO - AHORA CLICKEABLE */}
      <Link 
        to={`/product/${product.id}`}
        className="relative overflow-hidden bg-gradient-to-br from-[#5FCDD9]/10 to-[#04BFAD]/10 block"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400?text=Producto';
          }}
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#172026]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* BADGE DE CATEGORÍA */}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-[#027373] px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            {product.category}
          </span>
        </div>

        {/* BADGE DE STOCK */}
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium shadow-lg ${
              product.stock > 10
                ? 'bg-[#04BF9D] text-white'
                : product.stock > 0
                ? 'bg-[#5FCDD9] text-[#172026]'
                : 'bg-red-500 text-white'
            }`}
          >
            {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
          </span>
        </div>

        {/* BOTÓN DE FAVORITO */}
        <button 
          className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110"
          onClick={(e) => {
            e.preventDefault(); // Evitar navegación cuando se hace click en favorito
            e.stopPropagation();
            // Aquí puedes agregar lógica de favoritos
          }}
        >
          <svg
            className="w-5 h-5 text-[#027373] hover:text-[#04BF9D] transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* INDICADOR DE VER DETALLES */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-white/90 backdrop-blur-sm text-[#027373] px-4 py-2 rounded-full font-medium shadow-lg transform scale-95 group-hover:scale-100 transition-transform duration-300 flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Ver Detalles</span>
          </div>
        </div>
      </Link>

      {/* INFO DEL PRODUCTO */}
      <div className="p-6">
        <Link 
          to={`/product/${product.id}`}
          className="block group-hover:text-[#027373] transition-colors"
        >
          <h3 className="text-xl font-bold text-[#172026] mb-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-[#027373] text-sm mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* RATING */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex space-x-1">{renderStars(product.rating)}</div>
          <span className="text-sm text-[#04BFAD]">
            ({product.rating}) • {product.reviewCount} reseñas
          </span>
        </div>

        {/* PRECIO */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-[#172026]">
              ${product.price.toLocaleString()}
            </span>
            <span className="text-sm text-[#027373]/70 line-through ml-2">
              ${(product.price * 1.2).toLocaleString()}
            </span>
          </div>

          <div className="bg-[#04BF9D] text-white px-2 py-1 rounded-lg text-xs font-bold">-20%</div>
        </div>

        {/* CARACTERÍSTICAS */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['Garantía 1 año', 'Envío gratis'].map((feature) => (
            <span
              key={feature}
              className="bg-[#5FCDD9]/20 text-[#027373] px-2 py-1 rounded-lg text-xs font-medium"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* BOTONES */}
        <div className="space-y-3">
          <Link
            to={`/product/${product.id}`}
            className="w-full bg-[#027373] hover:bg-[#04BFAD] text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Ver Detalles</span>
          </Link>

          <button
            id={`add-btn-${product.id}`}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full font-bold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 ${
              product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#5FCDD9] hover:bg-[#04BFAD] text-[#172026]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 4H19m-10-4v6a2 2 0 104 0v-6m-4 0h4" />
            </svg>
            <span>{product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}</span>
          </button>
        </div>
      </div>

      {/* EFECTO BRILLO */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    </div>
  );
};

export default ProductCard;