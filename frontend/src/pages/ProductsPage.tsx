// src/pages/ProductsPage.tsx
import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/shop/ProductCard';
import Loading from '../components/common/Loading';

const ProductsPage: React.FC = () => {
  const { products, loading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtrar y ordenar productos
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // Obtener categorías únicas
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // ESTADO DE CARGA
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <Loading message="Cargando productos increíbles..." size="lg" />
            <p className="mt-4 text-gray-600">Preparando la mejor selección para ti...</p>
          </div>
        </div>
      </div>
    );
  }

  // ESTADO DE ERROR
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto bg-red-100 rounded-3xl flex items-center justify-center mb-6">
              <span className="text-4xl">❌</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Error al cargar productos</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <p className="text-sm text-gray-500 mb-8">
              Verifica que el backend esté funcionando en puerto 5000
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
            >
              🔄 Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* CONTENIDO PRINCIPAL */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {/* BARRA DE FILTROS Y BÚSQUEDA */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* BÚSQUEDA */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-200 text-gray-700 font-medium"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* FILTRO POR CATEGORÍA */}
              <div className="lg:w-48">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full py-4 px-4 bg-gray-50 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-200 text-gray-700 font-medium"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* ORDENAR */}
              <div className="lg:w-56">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full py-4 px-4 bg-gray-50 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-200 text-gray-700 font-medium"
                >
                  <option value="name">Ordenar por nombre</option>
                  <option value="price-low">Precio: menor a mayor</option>
                  <option value="price-high">Precio: mayor a menor</option>
                </select>
              </div>

              {/* VISTA */}
              <div className="flex bg-gray-50 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-md text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white shadow-md text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* RESULTADOS Y GRID */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-gray-600">
                {filteredProducts.length > 0 ? (
                  <>
                    Mostrando <strong>{filteredProducts.length}</strong> de{' '}
                    <strong>{products.length}</strong> productos
                    {searchTerm && (
                      <>
                        {' '}
                        para "<strong>{searchTerm}</strong>"
                      </>
                    )}
                  </>
                ) : (
                  'No se encontraron productos'
                )}
              </p>

              {/* LIMPIAR FILTROS */}
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="text-primary hover:text-secondary font-medium transition-colors duration-200 flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span>Limpiar filtros</span>
                </button>
              )}
            </div>
          </div>

          {/* GRID DE PRODUCTOS */}
          {filteredProducts.length === 0 ? (
            // ESTADO VACÍO
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No encontramos productos</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm
                  ? `No hay productos que coincidan con "${searchTerm}". Intenta con otros términos de búsqueda.`
                  : 'No hay productos en esta categoría. Prueba con otra categoría.'}
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            // GRID O LISTA DE PRODUCTOS
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
                  : 'space-y-6'
              }
            >
              {filteredProducts.map(product => (
                <div key={product.id} className={viewMode === 'list' ? 'max-w-4xl mx-auto' : ''}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {/* SECCIÓN DE AYUDA */}
          {filteredProducts.length > 0 && (
            <div className="mt-16 bg-gradient-to-br from-highlight to-accent/10 rounded-3xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ¿No encuentras lo que buscas?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Nuestro equipo está aquí para ayudarte a encontrar el producto perfecto. Contáctanos
                y te asesoraremos sin compromiso.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200 inline-flex items-center justify-center space-x-2"
                >
                  <span>💬</span>
                  <span>Contactar Asesor</span>
                </a>
                <a
                  href="tel:+1555123456"
                  className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-2xl transition-all duration-200 inline-flex items-center justify-center space-x-2"
                >
                  <span>📞</span>
                  <span>Llamar Ahora</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
