// src/pages/HomePage.tsx
import React from 'react';
import { brandConfig } from '../utils/brandConfig';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/shop/ProductCard';
import Loading from '../components/common/Loading';

const HomePage: React.FC = () => {
  const { products, loading } = useProducts();
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Fondo */}
        <div className="absolute inset-0">
          {/* Fondo base */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0b0b] via-[#030505] to-black"></div>

          {/* Gradiente decorativo */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-[#339f96]/30 via-transparent to-[#FBBF24]/20 opacity-80"></div>

          {/* Formas geométricas */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#339f96]/20 to-[#FBBF24]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-[#FBBF24]/20 to-[#339f96]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-[#339f96]/10 to-[#FBBF24]/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Contenido */}
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Texto */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-black/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-full px-4 py-2 mb-8 shadow-lg">
                <div className="w-2 h-2 bg-[#339f96] rounded-full animate-pulse"></div>
                <span className="text-gray-200 font-medium text-sm">
                  ✨ Bienvenido a la mejor experiencia 
                </span>
              </div>

              {/* Título */}
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight tracking-tight">
                <span className="block bg-gradient-to-r from-[#339f96] via-[#3dbc98] to-[#FBBF24] bg-clip-text text-transparent">
                  Elegancia Urban
                </span>
                <span className="block text-4xl lg:text-4xl text-gray-600 dark:text-gray-400 font-light italic">
                  "El arte de vestir la ciudad"
                </span>
              </h1>

              {/* Subtítulo */}
              <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-2xl">
                Descubre moda <strong>urbana premium</strong> con estilo único, precios increíbles y una experiencia de compra que te <em>definirá</em>.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-10">
                {[
                  { number: '10K+', label: 'Clientes felices' },
                  { number: '500+', label: 'Prendas únicas' },
                  { number: '99.8%', label: 'Satisfacción' },
                ].map(({ number, label }) => (
                  <div key={label} className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {number}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
                  </div>
                ))}
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/products"
                  className="group bg-gradient-to-r from-[#339f96] to-[#FBBF24] hover:opacity-90 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center space-x-3"
                >
                  <span>🚀 Explorar Moda</span>
                  <svg
                    className="w-4 h-5 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>

                <Link
                  to="/contact"
                  className="group bg-gray-900 dark:bg-gray-700 border border-gray-600 hover:bg-gray-800 text-gray-200 font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                >
                  <span>💬 Contáctanos</span>
                </Link>
              </div>
            </div>

            {/* Imagen Hero */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-8 mb-6 relative overflow-hidden">
                    <div className="relative z-10 flex items-center justify-center h-40">
                      <div className="w-32 h-32 bg-gradient-to-br from-gray-200 dark:from-gray-600 via-gray-300 dark:via-gray-700 to-gray-400 dark:to-gray-800 rounded-[2rem] shadow-2xl relative">
                        <div className="absolute inset-2 bg-black rounded-[1.5rem] flex items-center justify-center">
                          <div className="w-20 h-20 bg-gradient-to-r from-[#9333EA] to-[#EC4899] rounded-2xl flex items-center justify-center">
                            <span className="text-white text-2xl">👕</span>
                          </div>
                        </div>
                        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-black rounded-full"></div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#EC4899]/20 rounded-full blur-xl"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#FBBF24]/20 rounded-full blur-lg"></div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Chaqueta Urban Premium
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Edición limitada, estilo que marca tendencia.
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      $149
                    </span>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 text-[#FBBF24] fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-[#339f96] text-white px-3 py-1 rounded-xl text-sm font-bold shadow-lg">
                  ¡Nuevo!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE PRODUCTOS DESTACADOS */}
      <section className="py-20 ">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-[#339f96] text-[#1F2937] dark:text-[#F9FAFB] rounded-full px-4 py-2 mb-6">
              <span className="text-lg">⭐</span>
              <span className="font-medium">Productos Destacados</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Los más <span className="text-[#339f96]">populares</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Descubre las prendas más vendidas y mejor valoradas por nuestra comunidad
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <Loading message="Cargando moda increíble..." size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white font-semibold py-4 px-8 rounded-2xl hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>Ver Todos los Productos</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE BENEFICIOS */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🚚',
                title: 'Envío Gratis',
                description: 'En compras mayores a $100. Entrega en 24-48 horas.',
              },
              {
                icon: '🛡️',
                title: 'Garantía Premium',
                description: 'Hasta 2 años de garantía en todas nuestras prendas.',
              },
              {
                icon: '💬',
                title: 'Soporte 24/7',
                description: 'Atención personalizada cuando la necesites.',
              },
            ].map(({ icon, title, description }) => (
              <div
                key={title}
                className="bg-transparent border border-gray-300 dark:border-gray-700 rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-xl font-bold text-[#EC4899] mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;


