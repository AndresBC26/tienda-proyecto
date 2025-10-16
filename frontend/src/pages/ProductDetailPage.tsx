// src/pages/ProductDetailPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, Size, Variant, useProducts } from '../hooks/useProducts';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import ProductCard from '../components/shop/ProductCard';
import Loading from '../components/common/Loading';
import axios from 'axios';
import { Star, Truck, Shield, RefreshCw, ChevronDown, Share2 } from 'lucide-react';
import { brandConfig } from '../utils/brandConfig';

interface ProductReview {
    _id: string;
    user: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

const API_URL = process.env.REACT_APP_API_URL;

// --- Componente Auxiliar para el Acordeón ---
interface DisclosureItemProps {
    title: string;
    children: React.ReactNode;
}

const DisclosureItem: React.FC<DisclosureItemProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-800 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 bg-white/5 hover:bg-white/10 transition-colors duration-200"
            >
                <span className="font-semibold text-white">{title}</span>
                <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
            >
                <div className="p-4 bg-black/20">
                    {children}
                </div>
            </div>
        </div>
    );
};


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
    
    const [selectedColor, setSelectedColor] = useState<Variant | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [currentImage, setCurrentImage] = useState('');

    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState('');
    const addToCartBtnRef = useRef<HTMLButtonElement>(null);
    
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
    const shareMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchProductAndReviews = async () => {
            setLoading(true);
            if (!productsLoading && products.length > 0) {
                const foundProduct = products.find((p: Product) => p._id === id);
                if (foundProduct) {
                    setProduct(foundProduct);
                    
                    if (foundProduct.variants && foundProduct.variants.length > 0) {
                        const firstVariant = foundProduct.variants[0];
                        setSelectedColor(firstVariant);
                        setCurrentImage(firstVariant.images[0] || '');
                    }

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
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
                setIsShareMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleColorSelect = (variant: Variant) => {
        setSelectedColor(variant);
        setCurrentImage(variant.images[0] || '');
        setSelectedSize('');
        setQuantity(1);
    };
    
    // ================================================================
    // ===== ✅ INICIO DE LA CORRECCIÓN: Función para cambiar talla =====
    // ================================================================
    const handleSizeSelect = (size: string) => {
        setSelectedSize(size);
        setQuantity(1); // Se reinicia la cantidad a 1
    };
    // ================================================================
    // ===== ✅ FIN DE LA CORRECCIÓN ===================================
    // ================================================================

    const selectedSizeData = selectedColor?.sizes.find((s: Size) => s.size === selectedSize);
    const maxQuantityForSelection = selectedSizeData?.stock || 0;
    const isAddToCartDisabled = !selectedColor || !selectedSize || maxQuantityForSelection === 0;

    const handleAddToCart = () => {
        if (!product || !selectedColor || !selectedSize) {
            notify('Por favor, selecciona un color y una talla para añadir al carrito.', 'error');
            return;
        }
        dispatch({
            type: 'ADD_PRODUCTS_TO_CART',
            payload: {
                product,
                quantity,
                size: selectedSize,
                color: selectedColor.colorName,
                image: currentImage,
            },
        });

        notify(`${product.name} (${selectedColor.colorName}) añadido al carrito`, 'success');

        if (addToCartBtnRef.current) {
            addToCartBtnRef.current.classList.add('animate-pulse');
            setTimeout(() => {
                if (addToCartBtnRef.current) {
                    addToCartBtnRef.current.classList.remove('animate-pulse');
                }
            }, 600);
        }
    };
    
    const handleBuyNow = () => {
        if (!product || !selectedColor || !selectedSize) {
          notify('Por favor, selecciona un color y talla primero.', 'error');
          return;
        }
        dispatch({
          type: 'ADD_PRODUCTS_TO_CART',
          payload: {
            product,
            quantity,
            size: selectedSize,
            color: selectedColor.colorName,
            image: currentImage,
          },
        });
        navigate('/cart');
    };

    const handleQuantityChange = (change: number) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= maxQuantityForSelection) {
            setQuantity(newQuantity);
        }
    };
    
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
    
    const renderStars = (rating: number, size = 20, isInteractive = false) => {
        return (
          <div className="flex space-x-1">
            {Array.from({ length: 5 }, (_, i) => (
              <button key={i} type="button" onClick={() => isInteractive && setUserRating(i + 1)} className={isInteractive ? 'cursor-pointer' : 'cursor-default'}>
                <Star size={size} className={i + 1 <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
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
          await axios.post(`${API_URL}/api/reviews`, { productId: product?._id, rating: userRating, comment: userComment }, { headers: { Authorization: `Bearer ${token}` } });
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
    
    const relatedProducts = products.filter((p: Product) => p.category === product?.category && p._id !== product?._id).slice(0, 4);

    if (loading || productsLoading) {
        return <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] flex items-center justify-center"><Loading message="Cargando producto..." size="lg" /></div>;
    }
    
    if (!product) {
        return <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] py-10 flex items-center justify-center"><div className="container mx-auto px-6 text-center"><h1 className="text-2xl font-bold text-gray-100 mb-4">Producto no encontrado</h1><Link to="/products" className="inline-block py-3 px-6 rounded-xl bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black font-medium">Ver Todos los Productos</Link></div></div>;
    }

    const longDescription = product?.description || 'Este es un producto de alta calidad diseñado para ofrecer el máximo confort y durabilidad...';
    const shouldTruncate = longDescription.length > 200;
    const displayedDescription = isDescriptionExpanded ? longDescription : shouldTruncate ? longDescription.slice(0, 200) + '...' : longDescription;

    const productUrl = window.location.href;
    const shareText = `¡Mira esta increíble camiseta de ${brandConfig.name}: ${product.name}!`;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
    const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)} ${encodeURIComponent(productUrl)}`;
    const instagramUrl = brandConfig.social.instagram;


    return (
        <div className="bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] text-gray-300 pt-20">
            <div className="container mx-auto px-4 sm:px-6 py-8">
                <div className="grid lg:grid-cols-2 gap-12">
                    
                    <div className="relative">
                        <div className="sticky top-24">
                            <div className="relative group aspect-square overflow-hidden rounded-2xl">
                                <img 
                                    key={currentImage} 
                                    src={currentImage || '/placeholder.jpg'} 
                                    alt={`${product.name} - ${selectedColor?.colorName}`} 
                                    className="w-full h-full object-cover rounded-2xl transition-all duration-300 shadow-xl group-hover:scale-105"
                                />
                                <div ref={shareMenuRef} className="absolute top-4 right-4 flex flex-col items-center gap-2">
                                    <button onClick={toggleWishlist} className={`p-3 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-110 ${isWishlisted ? 'bg-red-500/30 text-red-400' : 'bg-black/40 text-gray-300'}`} type="button" title="Añadir a favoritos">
                                        <svg className="w-6 h-6" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                    </button>
                                    
                                    <div className="relative">
                                        <button onClick={() => setIsShareMenuOpen(!isShareMenuOpen)} className="p-3 rounded-full backdrop-blur-sm bg-black/40 text-gray-300 transition-all duration-300 transform hover:scale-110" type="button" title="Compartir">
                                            <Share2 className="w-6 h-6" />
                                        </button>

                                        {isShareMenuOpen && (
                                            <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900/80 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-2 z-20">
                                                <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-lg">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z" /></svg>
                                                    Facebook
                                                </a>
                                                <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-lg">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM12.04 20.1c-1.53 0-3.01-.4-4.29-1.15l-.3-.18-3.18.83.85-3.1-.2-.32c-.82-1.33-1.26-2.83-1.26-4.38 0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.28.86 5.82 2.41s2.41 3.63 2.41 5.82c0 4.55-3.7 8.24-8.23 8.24zm4.52-6.13c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.15.17-.29.19-.54.06-.25-.12-1.07-.39-2.04-1.26-.75-.67-1.26-1.5-1.41-1.76-.15-.25-.02-.38.1-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.55-.42-.15 0-.31 0-.47 0-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05 0 1.21.88 2.37 1 2.54.12.17 1.76 2.68 4.27 3.78 2.51 1.09 2.51.73 2.96.7.45-.04 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.07-.1-.23-.16-.48-.28z" /></svg>
                                                    WhatsApp
                                                </a>
                                                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-lg">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z" /></svg>
                                                    Instagram
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {selectedColor?.images.map((img, index) => (
                                    <button key={index} onClick={() => setCurrentImage(img)} className={`w-16 h-16 rounded-lg border-2 transition-all duration-200 ${currentImage === img ? 'border-[#60caba]' : 'border-transparent hover:border-white/50'}`}>
                                        <img src={img} alt={`Vista ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-8">
                        <div>
                            <nav className="flex text-xs text-gray-500 mb-4 space-x-2">
                                <Link to="/" className="hover:text-gray-300">Inicio</Link><span>/</span>
                                <Link to="/products" className="hover:text-gray-300">Productos</Link><span>/</span>
                                <span className="text-gray-300 truncate">{product.name}</span>
                            </nav>
                            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">{product.name}</h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
                                <span className="text-4xl font-extrabold bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">${product.price.toLocaleString()}</span>
                                <div className="flex items-center space-x-2">
                                    {renderStars(product.rating)}
                                    <span className="text-sm text-gray-400">({product.reviewCount} reseñas)</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white/5 p-6 rounded-2xl border border-gray-800 shadow-lg">
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-lg font-semibold text-white">Color</h3>
                                    <span className="text-sm text-gray-400">{selectedColor?.colorName}</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants.map((variant) => (
                                        <button 
                                            key={variant.colorName} 
                                            onClick={() => handleColorSelect(variant)} 
                                            className={`w-10 h-10 rounded-full border-2 transition-transform duration-200 transform hover:scale-110 ${selectedColor?.colorName === variant.colorName ? 'border-white ring-2 ring-offset-2 ring-offset-[#151515] ring-white' : 'border-gray-700'}`} 
                                            style={{ backgroundColor: variant.colorHex }} 
                                            title={variant.colorName} 
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-lg font-semibold text-white">Seleccionar Talla</h3>
                                    {selectedSizeData && <span className="text-xs font-mono px-2 py-1 rounded-full bg-green-500/10 text-green-400">{selectedSizeData.stock} en stock</span>}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {selectedColor?.sizes.map((s) => (
                                        <button 
                                            key={s.size} 
                                            onClick={() => handleSizeSelect(s.size)} 
                                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${selectedSize === s.size ? 'bg-[#60caba] text-black border-[#60caba]' : 'border-gray-600 text-gray-300 hover:border-white'} ${s.stock === 0 ? 'opacity-50 line-through cursor-not-allowed' : ''}`} 
                                            disabled={s.stock === 0}>
                                            {s.size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 mt-8">
                                <div className="flex items-center w-full md:w-40 border border-gray-600 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                                    <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} className="px-4 py-3 text-lg disabled:opacity-30 hover:bg-white/10 w-1/3">-</button>
                                    <span className="flex-1 text-center py-3 text-lg font-medium">{quantity}</span>
                                    <button onClick={() => handleQuantityChange(1)} disabled={quantity >= maxQuantityForSelection} className="px-4 py-3 text-lg disabled:opacity-30 hover:bg-white/10 w-1/3">+</button>
                                </div>
                                <button ref={addToCartBtnRef} onClick={handleAddToCart} disabled={isAddToCartDisabled} className="w-full bg-gradient-to-r from-[#60caba] to-[#4ab7a8] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105">
                                    {isAddToCartDisabled ? (selectedColor && !selectedSize ? 'Selecciona una talla' : 'No disponible') : 'Añadir al Carrito'}
                                </button>
                            </div>
                            <button onClick={handleBuyNow} disabled={isAddToCartDisabled} className="w-full mt-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105">Comprar Ahora</button>
                        </div>
                        
                        <div className="space-y-2">
                            <DisclosureItem title="Descripción del Producto">
                                <p className="text-gray-400 leading-relaxed">{displayedDescription}</p>
                                {shouldTruncate && (<button onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="mt-2 text-[#60caba] hover:text-[#4ab7a8] text-sm font-medium">{isDescriptionExpanded ? 'Ver menos' : 'Ver más'}</button>)}
                            </DisclosureItem>
                            
                            <DisclosureItem title="Políticas de la Tienda">
                                <ul className="space-y-4 text-gray-400">
                                    <li className="flex items-center gap-4">
                                        <Truck className="w-8 h-8 text-[#60caba] flex-shrink-0" />
                                        <div>
                                            <span className="font-semibold text-gray-200">Envío Gratis</span>
                                            <p className="text-sm">En pedidos superiores a $100.000.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-center gap-4">
                                        <RefreshCw className="w-8 h-8 text-[#60caba] flex-shrink-0" />
                                        <div>
                                            <span className="font-semibold text-gray-200">Devoluciones Fáciles</span>
                                            <p className="text-sm">Garantía de devolución de 30 días.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-center gap-4">
                                        <Shield className="w-8 h-8 text-[#60caba] flex-shrink-0" />
                                        <div>
                                            <span className="font-semibold text-gray-200">Pago Seguro</span>
                                            <p className="text-sm">Tus transacciones están 100% protegidas.</p>
                                        </div>
                                    </li>
                                </ul>
                            </DisclosureItem>
                        </div>
                    </div>
                </div>
                
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
                    ) : ( <p className="text-gray-400">Sé el primero en dejar una reseña para este producto.</p> )}

                    <form onSubmit={handleSubmitReview} className="mt-12 bg-white/5 rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Deja tu reseña</h3>
                        <div className="mb-4">{renderStars(userRating, 30, true)}</div>
                        <textarea className="w-full p-4 bg-black/30 rounded-xl text-gray-200" rows={4} placeholder="Escribe tu experiencia..." value={userComment} onChange={(e) => setUserComment(e.target.value)}></textarea>
                        <button type="submit" className="mt-4 bg-gradient-to-r from-[#60caba] to-[#4ab7a8] text-white font-bold py-3 px-6 rounded-xl">Enviar Reseña</button>
                    </form>
                </div>

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