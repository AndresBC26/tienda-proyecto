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

    // Filtra los productos de la lista completa para encontrar los favoritos
    const favoriteProducts = products.filter(product =>
        favoritesState.items.some(favItem => favItem._id === product._id)
    );

    if (productsLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loading message="Cargando productos favoritos..." size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-500px)] bg-gray-50 py-12">
            <div className="container mx-auto px-6">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">❤️ Tus Favoritos</h1>
                    <p className="text-gray-600">
                        {favoriteProducts.length} {favoriteProducts.length === 1 ? 'producto' : 'productos'} guardados
                    </p>
                </div>
                
                {favoriteProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500">No tienes productos en tu lista de favoritos.</p>
                        <Link to="/products" className="mt-4 inline-block bg-indigo-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200">
                            Explorar Productos
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