// src/pages/ProductDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, useProducts } from '../hooks/useProducts';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/shop/ProductCard';
import Loading from '../components/common/Loading';

// Interfaces para funcionalidades adicionales
interface ProductReview {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
  images?: string[];
  sellerResponse?: string;
}

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  available: boolean;
  priceModifier?: number;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading: productsLoading } = useProducts();
  const { dispatch } = useCart();

  // Estados del componente
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [reviewSort, setReviewSort] = useState('recent');

  // Datos mock para funcionalidades adicionales
  const productImages = [
    product?.image || '',
    'https://picsum.photos/800/600?random=1',
    'https://picsum.photos/800/600?random=2',
    'https://picsum.photos/800/600?random=3',
    'https://picsum.photos/800/600?random=4'
  ];

  const productVariants: Record<string, ProductVariant[]> = {
    color: [
      { id: 'red', name: 'Color', value: 'Rojo', available: true },
      { id: 'blue', name: 'Color', value: 'Azul', available: true },
      { id: 'green', name: 'Color', value: 'Verde', available: false }
    ],
    size: [
      { id: 'small', name: 'Talla', value: 'S', available: true },
      { id: 'medium', name: 'Talla', value: 'M', available: true },
      { id: 'large', name: 'Talla', value: 'L', available: true },
      { id: 'xlarge', name: 'Talla', value: 'XL', available: false }
    ]
  };

  const mockReviews: ProductReview[] = [
    {
      id: 1,
      userId: 1,
      userName: 'María González',
      rating: 5,
      comment: 'Excelente producto, superó mis expectativas. La calidad es increíble y llegó muy rápido.',
      date: '2025-01-15',
      verified: true,
      helpful: 23,
      images: ['https://picsum.photos/150/150?random=10'],
      sellerResponse: 'Gracias por tu reseña María, nos alegra que estés satisfecha con tu compra.'
    },
    {
      id: 2,
      userId: 2,
      userName: 'Carlos Rodríguez',
      rating: 4,
      comment: 'Muy buen producto, aunque el envío tardó un poco más de lo esperado.',
      date: '2025-01-10',
      verified: true,
      helpful: 15
    },
    {
      id: 3,
      userId: 3,
      userName: 'Ana Martínez',
      rating: 5,
      comment: 'Perfecto, tal como se muestra en las fotos. Lo recomiendo totalmente.',
      date: '2025-01-05',
      verified: true,
      helpful: 31,
      images: ['https://picsum.photos/150/150?random=11', 'https://picsum.photos/150/150?random=12']
    }
  ];

  // Cargar producto
  useEffect(() => {
    if (!productsLoading && products.length > 0) {
      const foundProduct = products.find(p => p.id === parseInt(id || ''));
      if (foundProduct) {
        setProduct(foundProduct);
        setSelectedVariants({ color: 'red', size: 'medium' });
      }
      setLoading(false);
    }
  }, [id, products, productsLoading]);

  // Funciones del componente
  const handleAddToCart = () => {
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      dispatch({ type: 'ADD_TO_CART', payload: product });
    }
    
    // Animación de éxito
    const btn = document.getElementById('add-to-cart-btn');
    if (btn) {
      btn.classList.add('animate-pulse');
      setTimeout(() => btn.classList.remove('animate-pulse'), 600);
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleVariantChange = (variantType: string, value: string) => {
    setSelectedVariants(prev => ({ ...prev, [variantType]: value }));
  };

  const handleImageZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZooming) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  const renderStars = (rating: number, size: string = 'w-4 h-4') => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`${size} ${i < Math.floor(rating) ? 'text-[#5FCDD9] fill-current' : 'text-gray-300 fill-current'}`}
        viewBox="0 0 20 20"
      >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    ));
  };

  const filteredReviews = mockReviews.filter(review => {
    if (reviewFilter === 'all') return true;
    if (reviewFilter === '5') return review.rating === 5;
    if (reviewFilter === '4') return review.rating === 4;
    if (reviewFilter === '3') return review.rating === 3;
    if (reviewFilter === '2') return review.rating === 2;
    if (reviewFilter === '1') return review.rating === 1;
    return true;
  }).sort((a, b) => {
    if (reviewSort === 'recent') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (reviewSort === 'helpful') return b.helpful - a.helpful;
    if (reviewSort === 'rating') return b.rating - a.rating;
    return 0;
  });

  const relatedProducts = products.filter(p => 
    p.category === product?.category && p.id !== product?.id
  ).slice(0, 4);

  if (loading || productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading message="Cargando producto..." size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
            <p className="text-gray-600 mb-8">El producto que buscas no existe o ha sido removido.</p>
            <Link
              to="/products"
              className="bg-[#5FCDD9] hover:bg-[#04BFAD] text-[#172026] font-bold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Ver Todos los Productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      
      {/* BREADCRUMB */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-2 text-sm text-[#027373]">
            <Link to="/" className="hover:text-[#04BFAD] transition-colors">Inicio</Link>
            <span>›</span>
            <Link to="/products" className="hover:text-[#04BFAD] transition-colors">Productos</Link>
            <span>›</span>
            <Link to={`/products?category=${product.category}`} className="hover:text-[#04BFAD] transition-colors">
              {product.category}
            </Link>
            <span>›</span>
            <span className="text-[#172026] font-medium line-clamp-1">{product.name}</span>
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* GALERÍA DE IMÁGENES */}
          <div className="space-y-4">
            
            {/* IMAGEN PRINCIPAL */}
            <div 
              className="relative bg-white rounded-3xl shadow-lg overflow-hidden aspect-square group cursor-zoom-in"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleImageZoom}
            >
              <img
                src={productImages[selectedImageIndex]}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${isZooming ? 'scale-150' : 'scale-100'}`}
                style={isZooming ? {
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                } : {}}
              />
              
              {/* BADGES */}
              <div className="absolute top-4 left-4 space-y-2">
                <span className="bg-[#04BF9D] text-white px-3 py-1 rounded-full text-sm font-bold">
                  -20%
                </span>
                {product.stock < 10 && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    ¡Solo {product.stock} restantes!
                  </span>
                )}
              </div>

              {/* BOTONES DE ACCIÓN FLOTANTES */}
              <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`w-12 h-12 rounded-full backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-110 ${
                    isWishlisted 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/90 text-gray-600 hover:text-red-500'
                  }`}
                >
                  <svg className="w-6 h-6 mx-auto" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center text-gray-600 hover:text-[#04BFAD]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* MINIATURAS */}
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    selectedImageIndex === index 
                      ? 'border-[#5FCDD9] shadow-lg' 
                      : 'border-gray-200 hover:border-[#04BFAD]'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Vista ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* INFORMACIÓN DEL PRODUCTO */}
          <div className="space-y-8">
            
            {/* HEADER DEL PRODUCTO */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="bg-[#E6F8F8] text-[#027373] px-3 py-1 rounded-full text-sm font-medium">
                  {product.category}
                </span>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-green-600 font-medium">Producto Verificado</span>
                </div>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-[#172026] mb-4 leading-tight">
                {product.name}
              </h1>
              
              {/* RATING Y RESEÑAS */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">{renderStars(product.rating, 'w-5 h-5')}</div>
                  <span className="text-lg font-semibold text-[#027373]">{product.rating}</span>
                </div>
                <span className="text-[#04BFAD]">•</span>
                <button 
                  onClick={() => setActiveTab('reviews')}
                  className="text-[#04BFAD] hover:text-[#027373] font-medium transition-colors"
                >
                  {product.reviewCount} reseñas
                </button>
                <span className="text-[#04BFAD]">•</span>
                <span className="text-green-600 font-medium">✓ En stock</span>
              </div>
            </div>

            {/* PRECIO */}
            <div className="bg-gradient-to-r from-[#E6F8F8] to-[#F0FDFD] rounded-2xl p-6">
              <div className="flex items-end space-x-4 mb-4">
                <span className="text-4xl font-bold text-[#172026]">
                  ${product.price.toLocaleString()}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  ${(product.price * 1.25).toLocaleString()}
                </span>
                <span className="bg-[#04BF9D] text-white px-3 py-1 rounded-lg text-sm font-bold">
                  -20%
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-[#027373]">
                <span>💳 Pago seguro</span>
                <span>🚚 Envío gratis</span>
                <span>↩️ Devolución 30 días</span>
              </div>
            </div>

            {/* VARIANTES */}
            <div className="space-y-6">
              {Object.entries(productVariants).map(([type, variants]) => (
                <div key={type}>
                  <h3 className="text-lg font-semibold text-[#172026] mb-3">
                    {variants[0].name}: <span className="text-[#027373]">{selectedVariants[type]}</span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {variants.map(variant => (
                      <button
                        key={variant.id}
                        onClick={() => variant.available && handleVariantChange(type, variant.value)}
                        disabled={!variant.available}
                        className={`px-4 py-2 rounded-xl border-2 font-medium transition-all duration-200 ${
                          selectedVariants[type] === variant.value
                            ? 'border-[#5FCDD9] bg-[#5FCDD9] text-[#172026] shadow-md'
                            : variant.available
                            ? 'border-gray-300 bg-white text-gray-700 hover:border-[#04BFAD] hover:text-[#04BFAD]'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {variant.value}
                        {!variant.available && (
                          <span className="ml-2 text-xs">Agotado</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* CANTIDAD Y BOTONES */}
            <div className="space-y-6">
              
              {/* SELECTOR DE CANTIDAD */}
              <div>
                <h3 className="text-lg font-semibold text-[#172026] mb-3">Cantidad</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="px-6 py-3 font-semibold text-lg">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="p-3 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.stock} disponibles
                  </span>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="space-y-4">
                <button
                  id="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-[#027373] hover:bg-[#04BFAD] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 4H19m-10-4v6a2 2 0 104 0v-6m-4 0h4" />
                  </svg>
                  <span className="text-lg">
                    {product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                  </span>
                  {quantity > 1 && (
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      {quantity} unidades
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    handleAddToCart();
                    navigate('/cart');
                  }}
                  disabled={product.stock === 0}
                  className="w-full bg-[#5FCDD9] hover:bg-[#04BFAD] disabled:bg-gray-300 disabled:cursor-not-allowed text-[#172026] font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-lg">Comprar Ahora</span>
                </button>
              </div>

              {/* INFORMACIÓN ADICIONAL */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Garantía 1 año</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span>Envío gratis</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h2a6 6 0 0112 0h2l-3 3-3-3h2a4 4 0 00-8 0H3z" />
                  </svg>
                  <span>Devolución 30 días</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Pago seguro</span>
                </div>
              </div>
            </div>

            {/* COMPARTIR EN REDES SOCIALES */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Compartir</h3>
              <div className="flex space-x-3">
                {[
                  { name: 'Facebook', icon: '📘', color: 'bg-blue-600 hover:bg-blue-700', url: `https://facebook.com/sharer/sharer.php?u=${window.location.href}` },
                  { name: 'Twitter', icon: '🐦', color: 'bg-sky-500 hover:bg-sky-600', url: `https://twitter.com/intent/tweet?text=${product.name}&url=${window.location.href}` },
                  { name: 'WhatsApp', icon: '💬', color: 'bg-green-500 hover:bg-green-600', url: `https://wa.me/?text=${product.name} ${window.location.href}` },
                  { name: 'Copiar', icon: '📋', color: 'bg-gray-600 hover:bg-gray-700', url: '' }
                ].map(({ name, icon, color, url }) => (
                  <button
                    key={name}
                    onClick={() => {
                      if (name === 'Copiar') {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Enlace copiado al portapapeles');
                      } else {
                        window.open(url, '_blank');
                      }
                    }}
                    className={`${color} text-white w-10 h-10 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center`}
                    title={`Compartir en ${name}`}
                  >
                    <span className="text-lg">{icon}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TABS DE INFORMACIÓN */}
        <div className="mb-16">
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            
            {/* NAVEGACIÓN DE TABS */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {[
                { id: 'description', label: 'Descripción', icon: '📝' },
                { id: 'specifications', label: 'Especificaciones', icon: '⚙️' },
                { id: 'reviews', label: `Reseñas (${mockReviews.length})`, icon: '⭐' },
                { id: 'shipping', label: 'Envíos', icon: '🚚' },
                { id: 'faq', label: 'FAQ', icon: '❓' }
              ].map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                    activeTab === id
                      ? 'border-[#5FCDD9] text-[#027373] bg-[#E6F8F8]'
                      : 'border-transparent text-gray-600 hover:text-[#04BFAD] hover:bg-gray-50'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* CONTENIDO DE TABS */}
            <div className="p-8">
              
              {/* TAB: DESCRIPCIÓN */}
              {activeTab === 'description' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-[#172026] mb-4">Descripción del Producto</h3>
                    <p className="text-gray-700 leading-relaxed text-lg mb-6">
                      {product.description}
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Este producto ha sido diseñado pensando en la calidad y durabilidad que nuestros clientes esperan. 
                      Fabricado con materiales premium y siguiendo los más altos estándares de calidad, garantiza una 
                      experiencia excepcional y años de uso confiable.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-[#172026] mb-4">Características Principales</h4>
                      <ul className="space-y-3">
                        {[
                          'Alta calidad de materiales',
                          'Diseño ergonómico y moderno',
                          'Fácil instalación y uso',
                          'Compatibilidad universal',
                          'Garantía extendida incluida'
                        ].map((feature, index) => (
                          <li key={index} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-[#5FCDD9] rounded-full"></div>
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-[#172026] mb-4">Beneficios</h4>
                      <ul className="space-y-3">
                        {[
                          'Ahorra tiempo y esfuerzo',
                          'Mejora la productividad',
                          'Reduce costos a largo plazo',
                          'Amigable con el medio ambiente',
                          'Soporte técnico incluido'
                        ].map((benefit, index) => (
                          <li key={index} className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: ESPECIFICACIONES */}
              {activeTab === 'specifications' && (
                <div>
                  <h3 className="text-2xl font-bold text-[#172026] mb-6">Especificaciones Técnicas</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      {[
                        { label: 'Modelo', value: `${product.name.slice(0, 10)}-2025` },
                        { label: 'Categoría', value: product.category },
                        { label: 'Peso', value: '2.5 kg' },
                        { label: 'Dimensiones', value: '30 x 20 x 15 cm' },
                        { label: 'Material', value: 'Aluminio y plástico ABS' }
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <span className="font-medium text-gray-700">{label}</span>
                          <span className="text-[#027373] font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: 'Color disponible', value: 'Múltiples opciones' },
                        { label: 'Garantía', value: '1 año' },
                        { label: 'Origen', value: 'Fabricado en Colombia' },
                        { label: 'Certificaciones', value: 'ISO 9001, CE' },
                        { label: 'Compatibilidad', value: 'Universal' }
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <span className="font-medium text-gray-700">{label}</span>
                          <span className="text-[#027373] font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: RESEÑAS */}
              {activeTab === 'reviews' && (
                <div>
                  
                  {/* RESUMEN DE RESEÑAS */}
                  <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-[#172026] mb-2">
                          Reseñas de Clientes
                        </h3>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">{renderStars(product.rating, 'w-6 h-6')}</div>
                            <span className="text-2xl font-bold text-[#027373]">{product.rating}</span>
                            <span className="text-gray-600">de 5</span>
                          </div>
                          <span className="text-gray-600">
                            {product.reviewCount} reseñas verificadas
                          </span>
                        </div>
                      </div>

                      {/* FILTROS Y ORDENAMIENTO */}
                      <div className="flex space-x-4 mt-4 lg:mt-0">
                        <select
                          value={reviewFilter}
                          onChange={(e) => setReviewFilter(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5FCDD9] focus:border-transparent"
                        >
                          <option value="all">Todas las estrellas</option>
                          <option value="5">5 estrellas</option>
                          <option value="4">4 estrellas</option>
                          <option value="3">3 estrellas</option>
                          <option value="2">2 estrellas</option>
                          <option value="1">1 estrella</option>
                        </select>
                        <select
                          value={reviewSort}
                          onChange={(e) => setReviewSort(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5FCDD9] focus:border-transparent"
                        >
                          <option value="recent">Más recientes</option>
                          <option value="helpful">Más útiles</option>
                          <option value="rating">Mejor calificación</option>
                        </select>
                      </div>
                    </div>

                    {/* DISTRIBUCIÓN DE CALIFICACIONES */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <h4 className="font-semibold text-gray-700 mb-4">Distribución de Calificaciones</h4>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(star => {
                          const count = mockReviews.filter(r => r.rating === star).length;
                          const percentage = (count / mockReviews.length) * 100;
                          return (
                            <div key={star} className="flex items-center space-x-3">
                              <span className="w-8 text-sm font-medium text-gray-700">{star}★</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-[#5FCDD9] h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="w-8 text-sm text-gray-600">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* LISTA DE RESEÑAS */}
                  <div className="space-y-6">
                    {filteredReviews.map(review => (
                      <div key={review.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#5FCDD9] to-[#04BFAD] rounded-full flex items-center justify-center text-white font-bold">
                              {review.userName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h5 className="font-semibold text-[#172026]">{review.userName}</h5>
                                {review.verified && (
                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Compra verificada</span>
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex space-x-1">{renderStars(review.rating)}</div>
                                <span className="text-sm text-gray-600">
                                  {new Date(review.date).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed mb-4">
                          {review.comment}
                        </p>

                        {/* IMÁGENES DE LA RESEÑA */}
                        {review.images && review.images.length > 0 && (
                          <div className="flex space-x-3 mb-4">
                            {review.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Foto de reseña ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                              />
                            ))}
                          </div>
                        )}

                        {/* RESPUESTA DEL VENDEDOR */}
                        {review.sellerResponse && (
                          <div className="bg-blue-50 rounded-xl p-4 mb-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <span className="font-semibold text-blue-700">Respuesta del vendedor</span>
                            </div>
                            <p className="text-blue-800">{review.sellerResponse}</p>
                          </div>
                        )}

                        {/* ACCIONES DE LA RESEÑA */}
                        <div className="flex items-center space-x-6 text-sm">
                          <button className="flex items-center space-x-2 text-gray-600 hover:text-[#04BFAD] transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            <span>Útil ({review.helpful})</span>
                          </button>
                          <button className="text-gray-600 hover:text-[#04BFAD] transition-colors">
                            Reportar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* BOTÓN PARA ESCRIBIR RESEÑA */}
                  <div className="mt-8 text-center">
                    <button className="bg-[#5FCDD9] hover:bg-[#04BFAD] text-[#172026] font-bold py-3 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                      Escribir una Reseña
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: ENVÍOS */}
              {activeTab === 'shipping' && (
                <div>
                  <h3 className="text-2xl font-bold text-[#172026] mb-6">Información de Envíos y Devoluciones</h3>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-[#027373] mb-4">📦 Opciones de Envío</h4>
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-xl p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Envío Estándar</span>
                            <span className="text-green-600 font-bold">GRATIS</span>
                          </div>
                          <p className="text-gray-600 text-sm">5-7 días hábiles</p>
                        </div>
                        <div className="border border-gray-200 rounded-xl p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Envío Express</span>
                            <span className="font-bold text-[#027373]">$15.000</span>
                          </div>
                          <p className="text-gray-600 text-sm">2-3 días hábiles</p>
                        </div>
                        <div className="border border-gray-200 rounded-xl p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Envío Inmediato</span>
                            <span className="font-bold text-[#027373]">$25.000</span>
                          </div>
                          <p className="text-gray-600 text-sm">Entrega al día siguiente</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-[#027373] mb-4">↩️ Política de Devoluciones</h4>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <svg className="w-5 h-5 text-green-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <p className="text-gray-700">30 días para devoluciones sin preguntas</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <svg className="w-5 h-5 text-green-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <p className="text-gray-700">Reembolso completo o cambio por otro producto</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <svg className="w-5 h-5 text-green-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <p className="text-gray-700">Envío de devolución gratuito</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <svg className="w-5 h-5 text-green-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <p className="text-gray-700">Producto en condiciones originales</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 bg-[#E6F8F8] rounded-xl p-6">
                    <h4 className="font-semibold text-[#027373] mb-3">🌎 Cobertura de Envíos</h4>
                    <p className="text-gray-700 mb-4">
                      Realizamos envíos a todo Colombia. Consulta los tiempos de entrega para tu ciudad:
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Principales ciudades:</strong>
                        <p className="text-gray-600">Bogotá, Medellín, Cali, Barranquilla</p>
                        <p className="text-[#027373] font-medium">2-3 días hábiles</p>
                      </div>
                      <div>
                        <strong>Ciudades secundarias:</strong>
                        <p className="text-gray-600">Bucaramanga, Cartagena, Pereira, etc.</p>
                        <p className="text-[#027373] font-medium">3-5 días hábiles</p>
                      </div>
                      <div>
                        <strong>Resto del país:</strong>
                        <p className="text-gray-600">Municipios y zonas rurales</p>
                        <p className="text-[#027373] font-medium">5-7 días hábiles</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: FAQ */}
              {activeTab === 'faq' && (
                <div>
                  <h3 className="text-2xl font-bold text-[#172026] mb-6">Preguntas Frecuentes</h3>
                  <div className="space-y-4">
                    {[
                      {
                        question: '¿Este producto viene con garantía?',
                        answer: 'Sí, todos nuestros productos incluyen garantía de 1 año contra defectos de fabricación. La garantía cubre reparación o reemplazo sin costo adicional.'
                      },
                      {
                        question: '¿Puedo cambiar mi pedido después de comprarlo?',
                        answer: 'Puedes modificar o cancelar tu pedido hasta 2 horas después de la compra, siempre que no haya sido procesado para envío. Contacta nuestro servicio al cliente.'
                      },
                      {
                        question: '¿Qué métodos de pago aceptan?',
                        answer: 'Aceptamos tarjetas de crédito/débito (Visa, MasterCard, American Express), PSE, transferencias bancarias, y pago contra entrega en algunas ciudades.'
                      },
                      {
                        question: '¿Hacen envíos internacionales?',
                        answer: 'Actualmente solo realizamos envíos dentro de Colombia. Estamos trabajando para expandir nuestro servicio a otros países próximamente.'
                      },
                      {
                        question: '¿Cómo hago seguimiento a mi pedido?',
                        answer: 'Una vez procesado tu pedido, recibirás un número de guía por email y SMS. Puedes hacer seguimiento en nuestra página web o directamente con la empresa transportadora.'
                      },
                      {
                        question: '¿El producto es compatible con...?',
                        answer: 'Este producto es compatible con la mayoría de sistemas estándar. Si tienes dudas específicas sobre compatibilidad, contáctanos antes de la compra para asegurar la compatibilidad.'
                      }
                    ].map((faq, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => {
                            const element = document.getElementById(`faq-${index}`);
                            if (element) {
                              element.classList.toggle('hidden');
                            }
                          }}
                          className="w-full text-left p-6 hover:bg-gray-50 transition-colors focus:outline-none"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-[#172026] pr-4">{faq.question}</h4>
                            <svg className="w-5 h-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        <div id={`faq-${index}`} className="hidden px-6 pb-6">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-gray-600 mb-4">¿No encontraste la respuesta que buscas?</p>
                    <Link
                      to="/contact"
                      className="bg-[#5FCDD9] hover:bg-[#04BFAD] text-[#172026] font-bold py-3 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Contáctanos</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PRODUCTOS RELACIONADOS */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#172026] mb-4">Productos Relacionados</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Descubre otros productos de la misma categoría que también podrían interesarte
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link
                to={`/products?category=${product.category}`}
                className="bg-white border-2 border-[#5FCDD9] text-[#027373] hover:bg-[#5FCDD9] hover:text-[#172026] font-bold py-3 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center space-x-2"
              >
                <span>Ver Más en {product.category}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* SECCIÓN ADICIONAL: FRECUENTEMENTE COMPRADOS JUNTOS */}
        <div className="mb-16">
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#172026] mb-6 flex items-center space-x-3">
              <span className="text-3xl">🛒</span>
              <span>Frecuentemente Comprados Juntos</span>
            </h2>
            
            <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
              
              {/* PRODUCTO ACTUAL */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-[#E6F8F8] to-[#CFF5F7] rounded-2xl overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-sm font-medium text-center mt-2 line-clamp-2 max-w-24">
                  {product.name.substring(0, 20)}...
                </p>
                <p className="text-[#027373] font-bold text-center text-sm">
                  ${product.price.toLocaleString()}
                </p>
              </div>

              <div className="text-2xl text-gray-400">+</div>

              {/* PRODUCTO COMPLEMENTARIO 1 */}
              {relatedProducts[0] && (
                <>
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#E6F8F8] to-[#CFF5F7] rounded-2xl overflow-hidden">
                      <img src={relatedProducts[0].image} alt={relatedProducts[0].name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-medium text-center mt-2 line-clamp-2 max-w-24">
                      {relatedProducts[0].name.substring(0, 20)}...
                    </p>
                    <p className="text-[#027373] font-bold text-center text-sm">
                      ${relatedProducts[0].price.toLocaleString()}
                    </p>
                  </div>

                  <div className="text-2xl text-gray-400">+</div>

                  {/* PRODUCTO COMPLEMENTARIO 2 */}
                  {relatedProducts[1] && (
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gradient-to-br from-[#E6F8F8] to-[#CFF5F7] rounded-2xl overflow-hidden">
                        <img src={relatedProducts[1].image} alt={relatedProducts[1].name} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-sm font-medium text-center mt-2 line-clamp-2 max-w-24">
                        {relatedProducts[1].name.substring(0, 20)}...
                      </p>
                      <p className="text-[#027373] font-bold text-center text-sm">
                        ${relatedProducts[1].price.toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div className="text-2xl text-gray-400">=</div>

                  {/* PRECIO TOTAL Y DESCUENTO */}
                  <div className="bg-gradient-to-br from-[#E6F8F8] to-[#F0FDFD] rounded-2xl p-6 flex-1 min-w-0">
                    <h3 className="font-bold text-[#172026] mb-2">Compra el Combo</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Precio individual:</span>
                        <span className="text-sm line-through text-gray-500">
                          ${(product.price + relatedProducts[0].price + (relatedProducts[1]?.price || 0)).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-[#027373]">Precio combo:</span>
                        <span className="text-xl font-bold text-[#027373]">
                          ${Math.round((product.price + relatedProducts[0].price + (relatedProducts[1]?.price || 0)) * 0.9).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-green-600">
                        <span className="text-sm font-medium">Ahorras:</span>
                        <span className="text-sm font-bold">
                          ${Math.round((product.price + relatedProducts[0].price + (relatedProducts[1]?.price || 0)) * 0.1).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button className="w-full mt-4 bg-[#04BF9D] hover:bg-[#027373] text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                      Agregar Combo al Carrito
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* INDICADORES SOCIALES */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-[#E6F8F8] to-[#F0FDFD] rounded-3xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="w-16 h-16 bg-[#5FCDD9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#172026] mb-2">23 personas</h3>
                <p className="text-gray-600 text-sm">viendo este producto ahora</p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-[#04BFAD] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#172026] mb-2">157 personas</h3>
                <p className="text-gray-600 text-sm">agregaron a favoritos hoy</p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-[#04BF9D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 4H19m-10-4v6a2 2 0 104 0v-6m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#172026] mb-2">89 ventas</h3>
                <p className="text-gray-600 text-sm">en los últimos 7 días</p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-[#027373] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#172026] mb-2">4.8/5</h3>
                <p className="text-gray-600 text-sm">calificación promedio</p>
              </div>
            </div>
          </div>
        </div>

        {/* TIMER DE OFERTA LIMITADA */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">🔥 Oferta por Tiempo Limitado</h2>
            <p className="text-xl mb-6">Descuento del 20% - ¡Solo por hoy!</p>
            
            <div className="flex justify-center space-x-4 mb-6">
              {[
                { value: '23', label: 'Horas' },
                { value: '45', label: 'Minutos' },
                { value: '12', label: 'Segundos' }
              ].map(({ value, label }) => (
                <div key={label} className="bg-white/20 rounded-2xl p-4 min-w-[80px]">
                  <div className="text-3xl font-bold">{value}</div>
                  <div className="text-sm opacity-90">{label}</div>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleAddToCart}
              className="bg-white text-red-600 font-bold py-4 px-8 rounded-2xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              ¡Aprovecha la Oferta Ahora!
            </button>
          </div>
        </div>

        {/* INFORMACIÓN DE SEGURIDAD Y CONFIANZA */}
        <div className="mb-16">
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#172026] mb-6 text-center">¿Por qué Elegir Nuestros Productos?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#172026] mb-2">Calidad Garantizada</h3>
                <p className="text-gray-600 text-sm">
                  Productos verificados con garantía de calidad y durabilidad. Certificados internacionales.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#172026] mb-2">Compra Segura</h3>
                <p className="text-gray-600 text-sm">
                  Pagos protegidos con encriptación SSL. Datos seguros y protección al consumidor garantizada.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#172026] mb-2">Soporte 24/7</h3>
                <p className="text-gray-600 text-sm">
                  Atención al cliente disponible todos los días. Soporte técnico especializado incluido.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;