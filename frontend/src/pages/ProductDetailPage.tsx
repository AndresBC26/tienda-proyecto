// src/pages/ProductDetailPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, Size, useProducts } from '../hooks/useProducts';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import ProductCard from '../components/shop/ProductCard';
import Loading from '../components/common/Loading';
import axios from 'axios';
import { Star, Truck, Shield, RefreshCw } from 'lucide-react';

interface ProductReview {
  _id: string;
  user: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const API_URL = process.env.REACT_APP_API_URL;

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading: productsLoading } = useProducts();
  const { dispatch } = useCart();
  const { dispatch: favoritesDispatch, state: favoritesState } = useFavorites();
  const { isAuthenticated, user } = useAuth();
  const { notify } = useNotification();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({ size: '' });
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('reviews');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const addToCartBtnRef = useRef<HTMLButtonElement>(null);

  const totalStock = product?.sizes?.reduce((sum: number, size: Size) => sum + size.stock, 0) || 0;
  const selectedSizeStock = product?.sizes?.find((s: Size) => s.size === selectedVariants.size)?.stock;
  const maxQuantityForSelection = selectedSizeStock !== undefined ? selectedSizeStock : 0;
  const isAddToCartDisabled =
    totalStock === 0 ||
    (product?.sizes && product.sizes.length > 0 && !selectedVariants.size);

  const longDescription =
    product?.description ||
    'Este es un producto de alta calidad diseñado para ofrecer el máximo confort y durabilidad...';

  const shouldTruncate = longDescription.length > 200;
  const displayedDescription = isDescriptionExpanded
    ? longDescription
    : shouldTruncate
    ? longDescription.slice(0, 200) + '...'
    : longDescription;

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      setLoading(true);
      if (!productsLoading && products.length > 0) {
        const foundProduct = products.find((p: Product) => p._id === id);
        if (foundProduct) {
          setProduct(foundProduct);
          setSelectedVariants({ size: '' });

          const isInWishlist = favoritesState.items.some((item: Product) => item._id === foundProduct._id);
          setIsWishlisted(isInWishlist);

          try {
            const reviewsRes = await axios.get(`${API_URL}/api/reviews/product/${foundProduct._id}`);
            setReviews(reviewsRes.data);
          } catch (err) {
            console.error('Error fetching reviews:', err);
            setReviews([]);
          }
        }
        setLoading(false);
      }
    };
    fetchProductAndReviews();
  }, [id, products, productsLoading, favoritesState.items]);

  const toggleWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!product) return;
    if (isWishlisted) {
      favoritesDispatch({ type: 'REMOVE_FROM_FAVORITES', payload: product._id });
      setIsWishlisted(false);
      notify('Eliminado de favoritos', 'info');
    } else {
      favoritesDispatch({ type: 'ADD_TO_FAVORITES', payload: product });
      setIsWishlisted(true);
      notify('¡Añadido a favoritos!', 'success');
    }
  };

  const handleBuyNow = () => {
    if (!product || !selectedVariants.size) {
      notify('Por favor, selecciona una talla primero.', 'error');
      return;
    }
    dispatch({
      type: 'ADD_PRODUCTS_TO_CART',
      payload: {
        product,
        quantity,
        size: selectedVariants.size,
      },
    });
    navigate('/cart');
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariants.size) {
      notify('Por favor, selecciona una talla para añadir al carrito.', 'error');
      return;
    }
    dispatch({
      type: 'ADD_PRODUCTS_TO_CART',
      payload: {
        product,
        quantity,
        size: selectedVariants.size,
      },
    });

    notify(`${product.name} añadido al carrito`, 'success');

    if (addToCartBtnRef.current) {
      addToCartBtnRef.current.classList.add('animate-pulse');
      setTimeout(() => {
        if (addToCartBtnRef.current) {
          addToCartBtnRef.current.classList.remove('animate-pulse');
        }
      }, 600);
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= maxQuantityForSelection) {
      setQuantity(newQuantity);
    }
  };

  const handleVariantChange = (variantType: string, value: string) => {
    setSelectedVariants((prev) => ({ ...prev, [variantType]: value }));
    setQuantity(1);
  };

  const renderStars = (rating: number, size = 20, isInteractive = false) => {
    return (
      <div className="flex space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => isInteractive && setUserRating(i + 1)}
            className={isInteractive ? 'cursor-pointer' : 'cursor-default'}
          >
            <Star
              size={size}
              className={i + 1 <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
            />
          </button>
        ))}
      </div>
    );
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      notify('Debes iniciar sesión para dejar una reseña.', 'error');
      return;
    }
    if (userRating === 0 || userComment.trim() === '') {
      notify('Por favor, proporciona una calificación y un comentario.', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/reviews`,
        { productId: product?._id, rating: userRating, comment: userComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      notify('¡Reseña enviada con éxito!', 'success');
      setUserRating(0);
      setUserComment('');

      if (product) {
        const reviewsRes = await axios.get(`${API_URL}/api/reviews/product/${product._id}`);
        setReviews(reviewsRes.data);
      }
    } catch (err: any) {
      notify(`Error al enviar reseña: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  const relatedProducts = products
    .filter((p: Product) => p.category === product?.category && p._id !== product?._id)
    .slice(0, 4);

  if (loading || productsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] flex items-center justify-center">
        <Loading message="Cargando producto..." size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] py-10 flex items-center justify-center">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-4">Producto no encontrado</h1>
          <Link
            to="/products"
            className="inline-block py-3 px-6 rounded-xl bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black font-medium"
          >
            Ver Todos los Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] text-gray-300 pt-20">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Imagen */}
          <div className="relative group">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105 shadow-xl"
            />
            <button
              onClick={toggleWishlist}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-110 ${
                isWishlisted
                  ? 'bg-red-500/30 text-red-400 hover:bg-red-500/40 shadow-lg shadow-red-500/20'
                  : 'bg-black/40 text-gray-300 hover:bg-black/60 hover:text-white'
              }`}
            >
              <svg className="w-6 h-6" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Detalles */}
          <div>
            <nav className="flex text-xs text-gray-500 mb-6 space-x-2">
              <Link to="/" className="hover:text-gray-300">
                Inicio
              </Link>
              <span>/</span>
              <Link to="/products" className="hover:text-gray-300">
                Productos
              </Link>
              <span>/</span>
              <span className="text-gray-300 truncate">{product.name}</span>
            </nav>

            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">{product.name}</h1>

            <div className="flex items-center space-x-4 mb-6">
              <span className="text-4xl font-extrabold bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
                ${product.price.toLocaleString()}
              </span>
              {renderStars(product.rating)}
              <span className="text-sm text-gray-400">({product.reviewCount} reseñas)</span>
            </div>

            <div className="mb-6 text-sm text-gray-400">
              {totalStock > 0 ? (
                <span className="text-green-400">{totalStock} disponibles</span>
              ) : (
                <span className="text-red-400">Sin stock</span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-white mb-3">Descripción</h3>
            <p className="text-gray-400 leading-relaxed">{displayedDescription}</p>
            {shouldTruncate && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-2 text-[#60caba] hover:text-[#4ab7a8] text-sm font-medium flex items-center"
              >
                {isDescriptionExpanded ? 'Ver menos' : 'Ver más'}
              </button>
            )}

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-3">Seleccionar Talla:</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((s) => (
                  <button
                    key={s.size}
                    onClick={() => handleVariantChange('size', s.size)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border ${
                      selectedVariants.size === s.size
                        ? 'bg-[#60caba] text-black border-[#60caba]'
                        : 'border-gray-600 text-gray-300 hover:border-white'
                    } ${s.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={s.stock === 0}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-3">Cantidad:</h3>
              <div className="flex items-center w-40 border border-gray-600 rounded-xl overflow-hidden bg-white/5">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="px-4 py-3 text-lg disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="flex-1 text-center py-3 text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= maxQuantityForSelection}
                  className="px-4 py-3 text-lg disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-4 mt-8">
              <button
                onClick={handleBuyNow}
                disabled={isAddToCartDisabled}
                className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:shadow-yellow-500/20 flex items-center justify-center space-x-2"
              >
                <span>Comprar Ahora</span>
              </button>

              <button
                ref={addToCartBtnRef}
                onClick={handleAddToCart}
                disabled={isAddToCartDisabled}
                className="w-full bg-gradient-to-r from-[#60caba] to-[#4ab7a8] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:shadow-teal-500/20 flex items-center justify-center space-x-2"
              >
                <span>Añadir al Carrito</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center bg-white/5 rounded-2xl p-6 mt-8">
              <div className="flex flex-col items-center">
                <Truck className="w-8 h-8 text-[#60caba]" />
                <span className="mt-2 text-sm font-medium">Envío Gratis</span>
                <span className="text-xs text-gray-400">+ $50.000</span>
              </div>
              <div className="flex flex-col items-center">
                <RefreshCw className="w-8 h-8 text-[#60caba]" />
                <span className="mt-2 text-sm font-medium">Devoluciones</span>
                <span className="text-xs text-gray-400">30 días garantía</span>
              </div>
              <div className="flex flex-col items-center">
                <Shield className="w-8 h-8 text-[#60caba]" />
                <span className="mt-2 text-sm font-medium">Pago Seguro</span>
                <span className="text-xs text-gray-400">Protegemos tus datos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reseñas */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">Reseñas ({reviews.length})</h2>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="bg-gray-800/40 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    {renderStars(review.rating)}
                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-300">{review.comment}</p>
                  <p className="mt-2 text-xs text-gray-500">– {review.userName}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Sé el primero en dejar una reseña para este producto.</p>
          )}

          <form onSubmit={handleSubmitReview} className="mt-12 bg-white/5 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Deja tu reseña</h3>
            <div className="mb-4">{renderStars(userRating, 30, true)}</div>
            <textarea
              className="w-full p-4 bg-black/30 rounded-xl text-gray-200 placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-[#60caba] transition-colors"
              rows={4}
              placeholder="Escribe tu experiencia..."
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
            ></textarea>
            <button
              type="submit"
              className="mt-4 bg-gradient-to-r from-[#60caba] to-[#4ab7a8] text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300"
            >
              Enviar Reseña
            </button>
          </form>
        </div>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">Productos Relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
