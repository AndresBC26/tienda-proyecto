// src/pages/FavoritesPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext';
import ProductCard from '../components/shop/ProductCard';
import Loading from '../components/common/Loading';
import { useProducts } from '../hooks/useProducts';

const FavoritesPage: React.FC = () => {
    const { products, loading: productsLoading, error } = useProducts();
    const { state: favoritesState } = useFavorites();

    const favoriteProducts = products.filter(product =>
        favoritesState.items.some(favItem => favItem._id === product._id)
    );

    if (productsLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] flex items-center justify-center">
                <Loading message="Cargando tus favoritos..." size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] flex items-center justify-center p-4">
                <div className="text-center bg-red-500/10 p-8 rounded-2xl border border-red-500/30">
                    <p className="text-red-300 text-lg">Error: {error}</p>
                    <p className="text-gray-400 mt-2">No se pudieron cargar los productos. Intenta recargar la página.</p>
                </div>
            </div>
        );
    }

    return (
        // ✅ CORRECCIÓN: Se eliminó la clase `min-h-[calc(...)]` de aquí
        <div className="bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] py-20 text-white">
            <div className="container mx-auto px-6">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
                        ❤️ Tus Favoritos
                    </h1>
                    <p className="text-gray-400">
                        {favoriteProducts.length} {favoriteProducts.length === 1 ? 'producto guardado' : 'productos guardados'}
                    </p>
                </div>
                
                {favoriteProducts.length === 0 ? (
                    <div className="text-center py-20 max-w-md mx-auto">
                        <div className="w-32 h-32 mx-auto bg-[#151515]/80 backdrop-blur-sm border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl mb-8">
                            <span className="text-6xl animate-pulse">💔</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Tu lista de favoritos está vacía</h2>
                        <p className="text-gray-400 mb-8">
                            Parece que aún no has agregado productos. ¡Explora nuestra colección y encuentra algo que te encante!
                        </p>
                        <Link 
                          to="/products" 
                          className="inline-block bg-gradient-to-r from-[#60caba] to-[#FFD700] hover:from-[#58b7a9] hover:to-[#E6C600] text-black font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            🛍️ Explorar Productos
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {favoriteProducts.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;