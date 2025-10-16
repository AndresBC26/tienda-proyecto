// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useScrollVisibility } from '../hooks/useScrollVisibility';
import { BiSolidTShirt, BiSolidLayer, BiSolidPalette } from "react-icons/bi";


const FeaturedProductsCarousel: React.FC = () => {
  const [currentProduct, setCurrentProduct] = useState(0);
  const { products, loading, error } = useProducts();

  // Asigna una insignia a los primeros 5 productos para que actúen como productos destacados
  const featuredProducts = products.slice(0, 5).map((p, index) => {
      let badge = 'NUEVO';
      if (index === 1) badge = 'POPULAR';
      if (index === 2) badge = 'OFERTA';
      if (index === 3) badge = 'TENDENCIA';
      return { ...p, badge };
  });

  useEffect(() => {
    if (featuredProducts.length > 1) {
        const interval = setInterval(() => {
            setCurrentProduct((prev) => (prev + 1) % featuredProducts.length);
        }, 5000);
        return () => clearInterval(interval);
    }
  }, [featuredProducts.length]);

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'NUEVO': return 'from-[#60caba] to-[#58b7a9]';
      case 'POPULAR': return 'from-[#FFD700] to-[#E6C600]';
      case 'OFERTA': return 'from-[#ec4899] to-[#be185d]';
      case 'TENDENCIA': return 'from-[#8b5cf6] to-[#7c3aed]';
      default: return 'from-[#60caba] to-[#58b7a9]';
    }
  };

  if (loading) {
      return <div className="text-center text-white p-8">Cargando productos destacados...</div>;
  }

  if (error) {
      return <div className="text-center text-red-500 p-8">Error al cargar los productos: {error}</div>;
  }

  if (featuredProducts.length === 0) {
    return <div className="text-center text-gray-400 p-8">No hay productos destacados disponibles en este momento.</div>;
  }

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Contenedor del Carrusel */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentProduct * 100}%)` }}
        >
          {featuredProducts.map((product) => {
            const displayImage = product.variants?.[0]?.images?.[0] || 'https://via.placeholder.com/400';
            
            return(
            <div key={product._id} className="w-full flex-shrink-0 p-6 lg:p-8">
              <div className="grid lg:grid-cols-2 gap-6 items-center">
                {/* Imagen del Producto */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-4 text-center relative overflow-hidden aspect-square">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#60caba]/20 via-transparent to-[#FFD700]/20"></div>
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <img
                        src={displayImage}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                      <div className={`absolute top-3 right-3 px-2 py-1 bg-gradient-to-r ${getBadgeColor(product.badge)} text-xs font-bold text-black rounded-full`}>
                        {product.badge}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del Producto */}
                <div className="text-center lg:text-left">
                  <div className="text-xs text-[#60caba] font-semibold mb-1">
                    {product.category}
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-100 mb-3">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-base mb-4 leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                    <span className="text-2xl font-bold bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
                      ${product.price.toLocaleString('es-CO')}
                    </span>
                    <span className="text-base text-gray-500 line-through">
                      ${(product.price * 1.25).toLocaleString('es-CO')}
                    </span>
                    <span className="px-2 py-0.5 bg-[#ec4899]/20 text-[#ec4899] text-xs font-semibold rounded-md">
                      -20%
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to={`/product/${product._id}`}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black font-bold rounded-xl hover:from-[#58b7a9] hover:to-[#E6C600] transition-all duration-300 transform hover:scale-105"
                    >
                      Ver Producto
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>

      {/* Puntos de Navegación */}
      <div className="flex justify-center space-x-2 mt-6">
        {featuredProducts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentProduct(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentProduct
                ? 'bg-gradient-to-r from-[#60caba] to-[#FFD700] scale-125'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Ir al producto ${index + 1}`}
          />
        ))}
      </div>

      {/* Flechas de Navegación */}
      {featuredProducts.length > 1 && (
          <>
            <button
                onClick={() => setCurrentProduct((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length)}
                className="absolute left-0 lg:-left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-black/70 hover:border-white/30 transition-all duration-300"
                aria-label="Producto anterior"
            >
                ←
            </button>

            <button
                onClick={() => setCurrentProduct((prev) => (prev + 1) % featuredProducts.length)}
                className="absolute right-0 lg:-right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-black/70 hover:border-white/30 transition-all duration-300"
                aria-label="Siguiente producto"
            >
                →
            </button>
          </>
        )}
    </div>
  );
};


const Homepage: React.FC = () => {
  const { isVisible: titleVisible } = useScrollVisibility(300);

  return (
    // ✅ CORRECCIÓN DEFINITIVA: Se ha eliminado `min-h-screen` de esta línea.
    <div className="bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b]">
      {/* Sección Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#60caba]/5 via-transparent to-[#FFD700]/5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#60caba]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#FFD700]/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
              Elegancia Urban
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            "El arte de vestir la ciudad"
          </p>

          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Descubre nuestra colección exclusiva de moda urbana que combina estilo,
            calidad y las últimas tendencias para expresar tu personalidad única.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/products"
              className="group relative px-8 py-4 bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black font-bold text-lg rounded-2xl shadow-lg shadow-[#60caba66] hover:from-[#58b7a9] hover:to-[#E6C600] transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10">Ver Colección</span>
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <Link
              to="/about"
              className="px-8 py-4 border-2 border-white/20 text-gray-100 font-semibold text-lg rounded-2xl hover:text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            >
              Conoce Más
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de Características */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          {/* Título visible solo en desktop, en móvil se oculta al hacer scroll */}
          <div className="text-center mb-16 relative">
            <h2 className={`text-4xl font-bold text-center mb-4 md:mb-16 transition-all duration-500 transform ${
              titleVisible ? 'opacity-100 translate-y-0' : 'md:opacity-100 md:translate-y-0 opacity-0 -translate-y-4'
            }`}>
              <span className="bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
                ¿Por qué elegir Elegancia Urban?
              </span>
            </h2>
            {/* Línea decorativa que permanece visible */}
            <div className="w-24 h-1 bg-gradient-to-r from-[#60caba] to-[#FFD700] mx-auto rounded-full opacity-100"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: '✨',
                title: 'Calidad Premium',
                description: 'Materiales de primera calidad seleccionados cuidadosamente para garantizar durabilidad y comodidad.',
                color: 'from-[#60caba] to-[#58b7a9]'
              },
              {
                icon: '🎯',
                title: 'Estilo Único',
                description: 'Diseños exclusivos que reflejan las últimas tendencias de la moda urbana contemporánea.',
                color: 'from-[#FFD700] to-[#E6C600]'
              },
              {
                icon: '🚀',
                title: 'Envío Rápido',
                description: 'Entrega express en 24-48 horas para que disfrutes tu nueva ropa sin esperas.',
                color: 'from-[#ec4899] to-[#be185d]'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold text-gray-100 mb-4">
                  {feature.title}
                </h3>

                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

<section className="py-20 px-4 bg-gradient-to-r from-white/5 via-transparent to-white/5 relative overflow-hidden">
  <div className="absolute top-10 left-20 w-32 h-32 bg-[#60caba]/20 rounded-full blur-2xl animate-pulse"></div>
  <div className="absolute bottom-20 right-10 w-48 h-48 bg-[#FFD700]/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-2 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

  <div className="container mx-auto relative z-10">
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold mb-4">
        <span className="bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
          Estilos Urbanos Destacados
        </span>
      </h2>
      <div className="w-24 h-1 bg-gradient-to-r from-[#60caba] to-[#FFD700] mx-auto rounded-full mb-6"></div>
      <p className="text-lg text-gray-400 max-w-2xl mx-auto">
        Descubre las tendencias que definen el streetwear moderno
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {[
        {
          name: 'Oversize',
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center',
          gradient: 'from-[#60caba]/80 to-[#58b7a9]/80',
          hoverGradient: 'from-[#60caba] to-[#58b7a9]',
          description: 'Estilo urbano contemporáneo',
          subtitle: 'Comodidad y tendencia',
          categoryValue: 'Camisetas Oversize',
          badge: 'MÁS VENDIDO',
          badgeColor: 'from-[#FFD700] to-[#F59E0B]',
          priceFrom: '35.000',
          bgPattern: 'conic-gradient(from 0deg, #60caba20, transparent, #60caba10, transparent)',
          emoji: '🔥'
        },
        {
          name: 'Básicas',
          image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop&crop=center',
          gradient: 'from-[#ec4899]/80 to-[#be185d]/80',
          hoverGradient: 'from-[#ec4899] to-[#be185d]',
          description: 'Cómodo y con actitud',
          subtitle: 'Los esenciales urbanos',
          categoryValue: 'Camisetas Basicas',
          badge: 'MEJOR PRECIO',
          badgeColor: 'from-[#10B981] to-[#059669]',
          priceFrom: '25.000',
          bgPattern: 'conic-gradient(from 120deg, #ec489920, transparent, #ec489910, transparent)',
          emoji: '⚡'
        },
        {
          name: 'Estampadas',
          image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&h=400&fit=crop&crop=center',
          gradient: 'from-[#8b5cf6]/60 to-[#FFD700]/60',
          hoverGradient: 'from-[#8b5cf6] to-[#FFD700]',
          description: 'Diseños exclusivos y únicos',
          subtitle: 'Expresa tu personalidad',
          categoryValue: 'Camisetas Estampadas',
          badge: 'EDICIÓN LIMITADA',
          badgeColor: 'from-[#8B5CF6] to-[#7C3AED]',
          priceFrom: '45.000',
          bgPattern: 'conic-gradient(from 240deg, #8b5cf620, transparent, #FFD70020, transparent)',
          emoji: '🎨'
        }
      ].map((category, index) => {
        return (
          <Link
            key={index}
            to={`/products?category=${encodeURIComponent(category.categoryValue)}`}
            className="group relative overflow-hidden bg-white/5 backdrop-blur-sm 
                       border border-white/10 rounded-3xl p-8 h-80 
                       flex flex-col justify-between
                       hover:bg-white/10 hover:border-white/20 hover:shadow-2xl
                       transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
            style={{
              animationDelay: `${index * 200}ms`
            }}
          >
            <div 
              className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
              style={{ background: category.bgPattern }}
            ></div>

            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div
              className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-20 transition-all duration-500`}
            ></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={`relative w-16 h-16 bg-gradient-to-r ${category.hoverGradient} rounded-2xl flex items-center justify-center 
                                group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg overflow-hidden`}>
                  <img 
                    src={category.image} 
                    alt={`${category.name} style`}
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
                </div>
                <div className="text-2xl group-hover:animate-bounce">
                  {category.emoji}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-100 group-hover:text-white transition-colors duration-300 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm font-medium text-[#60caba] group-hover:text-[#FFD700] transition-colors duration-300 mb-2">
                  {category.subtitle}
                </p>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm leading-relaxed">
                  {category.description}
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex flex-col space-y-2">
                <div className={`px-3 py-1 bg-gradient-to-r ${category.badgeColor} rounded-full`}>
                  <span className="text-xs font-bold text-white tracking-wide">{category.badge}</span>
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-xs text-gray-500 font-medium">Desde</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
                    ${category.priceFrom}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center text-gray-400 group-hover:text-white transition-colors duration-300">
                <span className="text-sm font-semibold mr-3">Ver Todo</span>
                <div className="relative w-8 h-8 rounded-full border-2 border-current flex items-center justify-center 
                               group-hover:scale-110 group-hover:border-[#FFD700] group-hover:bg-[#FFD700]/10 
                               transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#60caba] to-[#FFD700] opacity-0 group-hover:opacity-20 rounded-full"></div>
                  <span className="text-sm transform group-hover:translate-x-1 transition-transform duration-300 relative z-10">→</span>
                </div>
              </div>
            </div>

            <div className="absolute top-4 right-4 w-2 h-2 bg-[#FFD700] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
            <div className="absolute bottom-8 left-6 w-1 h-1 bg-[#60caba] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping delay-100"></div>
            <div className="absolute top-1/2 right-8 w-1.5 h-1.5 bg-[#ec4899] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping delay-200"></div>
          </Link>
        )
      })}
    </div>

    <div className="mt-16 text-center">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#60caba] rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-pulse delay-200"></div>
            <div className="w-3 h-3 bg-[#ec4899] rounded-full animate-pulse delay-500"></div>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-4">
          Encuentra tu estilo perfecto
        </h3>
        <p className="text-gray-300 mb-6 leading-relaxed max-w-2xl mx-auto">
          Cada categoría está cuidadosamente curada para ofrecerte lo mejor del streetwear urbano. 
          Desde lo minimalista hasta lo más expresivo, tenemos el estilo que buscas.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/products"
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black font-bold rounded-2xl 
                       hover:from-[#58b7a9] hover:to-[#E6C600] transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <span>Ver Toda la Colección</span>
            <div className="ml-3 w-6 h-6 rounded-full bg-black/20 flex items-center justify-center 
                           group-hover:bg-black/30 group-hover:scale-110 transition-all duration-300">
              <span className="text-sm transform group-hover:translate-x-0.5 transition-transform duration-300">→</span>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>750+ productos</span>
            </div>
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Nuevos arrivals</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


      {/* Carrusel de Productos Destacados */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
              Productos Destacados
            </span>
          </h2>

          <FeaturedProductsCarousel />
        </div>
      </section>

      {/* Sección CTA */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#60caba]/10 via-[#FFD700]/5 to-[#60caba]/10"></div>

        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
              ¿Listo para renovar tu estilo?
            </span>
          </h2>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Únete a miles de personas que ya confían en Elegancia Urban para expresar su personalidad única.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/products"
              className="group px-8 py-4 bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black font-bold text-lg rounded-2xl shadow-lg shadow-[#60caba66] hover:from-[#58b7a9] hover:to-[#E6C600] transition-all duration-300 transform hover:scale-105"
            >
              Explorar Productos
            </Link>

            <Link
              to="/favorites"
              className="px-8 py-4 border-2 border-[#ec4899] text-[#ec4899] font-semibold text-lg rounded-2xl hover:text-white hover:bg-[#ec4899] transition-all duration-300"
            >
              ❤️ Ver Favoritos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;