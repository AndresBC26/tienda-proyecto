// src/pages/Homepage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';

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
          {featuredProducts.map((product) => (
            <div key={product._id} className="w-full flex-shrink-0 p-6 lg:p-8">
              <div className="grid lg:grid-cols-2 gap-6 items-center">
                {/* Imagen del Producto */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-4 text-center relative overflow-hidden aspect-square">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#60caba]/20 via-transparent to-[#FFD700]/20"></div>
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <img
                        src={product.image}
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
                    <button className="px-5 py-2.5 border-2 border-white/20 text-gray-100 font-semibold rounded-xl hover:text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300">
                      ❤️ Favoritos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b]">
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
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
              ¿Por qué elegir Elegancia Urban?
            </span>
          </h2>

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

{/* Vista Previa de Categorías */}
<section className="py-20 px-4 bg-gradient-to-r from-white/5 via-transparent to-white/5">
  <div className="container mx-auto">
    <h2 className="text-4xl font-bold text-center mb-16">
      <span className="bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
        Estilos Urbanos Destacados
      </span>
    </h2>

    {/* Ahora ocupan más espacio */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto w-full">
      {[
        {
          name: 'Overzide',
          icon: '🔥',
          gradient: 'from-[#60caba]/80 to-[#58b7a9]/80',
          description: 'Estilo urbano contemporáneo'
        },
        {
          name: 'Basicas',
          icon: '👔',
          gradient: 'from-[#ec4899]/80 to-[#be185d]/80',
          description: 'Cómodo y con actitud'
        },
        {
          name: 'Estampadas',
          icon: '🎨',
          gradient: 'from-[#60caba]/60 to-[#FFD700]/60',
          description: 'Diseños exclusivos y únicos'
        }
      ].map((category, index) => (
        <Link
          key={index}
          to="/products"
          className="group relative overflow-hidden bg-white/5 backdrop-blur-sm 
                     border border-white/10 rounded-2xl p-8 h-64 
                     flex flex-col items-center justify-center 
                     hover:bg-white/10 hover:border-white/20 
                     transition-all duration-300 transform hover:scale-105 w-full"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
          ></div>

          <div className="relative z-10 text-center">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {category.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-100 group-hover:text-white transition-colors duration-300 mb-2">
              {category.name}
            </h3>
            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
              {category.description}
            </p>
          </div>

          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
        </Link>
      ))}
    </div>

    <div className="mt-12 text-center max-w-3xl mx-auto">
      <p className="text-lg text-gray-300 mb-6">
        Explora nuestras categorías especializadas en camisetas urbanas, diseñadas para expresar tu estilo único en la ciudad.
      </p>
      <Link
        to="/products"
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black font-semibold rounded-2xl hover:from-[#58b7a9] hover:to-[#E6C600] transition-all duration-300 transform hover:scale-105"
      >
        <span>Ver Todas las Categorías</span>
        <span className="ml-2">→</span>
      </Link>
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