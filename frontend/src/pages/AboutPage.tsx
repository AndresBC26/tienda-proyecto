// src/pages/AboutPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    // ✅ CORRECCIÓN DEFINITIVA: Se ha eliminado `min-h-[calc(100vh-500px)]` de esta línea.
    <div className="bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] text-gray-100">
      {/* HERO DE ABOUT */}
      <section className="bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] py-20 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#60caba]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#FFD700]/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* BADGE */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#60caba]/30 to-[#FFD700]/30 text-white rounded-full px-4 py-2 mb-6">
              <span className="text-lg">🔥</span>
              <span className="font-medium">Nuestra Cultura Urbana</span>
            </div>

            {/* TÍTULO */}
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
                Acerca de Elegancia Urban
              </span>
            </h1>

            {/* SUBTÍTULO */}
            <p className="text-xl text-gray-300 leading-relaxed">
              Conoce la historia, misión y el equipo detrás de Elegancia Urban. Una marca comprometida
              con la moda urbana y la expresión personal a través de la ropa.
            </p>
          </div>
        </div>
      </section>

      {/* NUESTRA HISTORIA */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 lg:p-12">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-[#60caba] to-[#FFD700] rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">📖</span>
                </div>
                <h2 className="text-3xl font-bold text-white">Nuestra Historia</h2>
              </div>

              <div className="text-gray-300 max-w-none">
                <p className="mb-6 text-lg leading-relaxed">
                  Fundada en <strong className="text-white">2022</strong> en el corazón de la escena urbana,
                  <strong className="bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent"> Elegancia Urban</strong> nació con la visión de
                  democratizar el estilo urbano de calidad. Comenzamos como un pequeño
                  emprendimiento con la firme creencia de que la moda debe ser
                  accesible para todos sin sacrificar el estilo.
                </p>

                <p className="mb-6 text-lg leading-relaxed">
                  Lo que comenzó como una idea entre amigos apasionados por la cultura urbana, hoy se ha convertido en una de las
                  marcas de camisetas urbanas más reconocidas. Hemos crecido de tener
                  <strong className="text-white"> 5 diseños</strong> a más de
                  <strong className="text-white"> 150 diseños exclusivos</strong>, y de atender
                  <strong className="text-white"> clientes locales</strong> a enviar a más de
                  <strong className="bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent"> 15.000 clientes satisfechos</strong> en todo el país.
                </p>

                <p className="text-lg leading-relaxed">
                  Nuestro crecimiento se basa en tres pilares fundamentales:
                  <strong className="text-white"> calidad premium en las telas</strong>,
                  <strong className="text-white"> diseños únicos y exclusivos</strong> y
                  <strong className="text-white"> servicio al cliente personalizado</strong>. Cada
                  camiseta que creamos pasa por rigurosos controles de calidad, y cada cliente
                  recibe atención personalizada para encontrar su estilo ideal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISIÓN Y VISIÓN */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* MISIÓN */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#60caba] to-[#58b7a9] rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Nuestra Misión</h3>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                Proporcionar prendas urbanas de alta calidad que permitan a nuestros clientes
                expresar su identidad única a través de diseños innovadores, manteniendo siempre
                precios accesibles y un compromiso con la sostenibilidad.
              </p>
            </div>

            {/* VISIÓN */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#FFD700] to-[#E6C600] rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">🌟</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Nuestra Visión</h3>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                Convertirnos en la marca de referencia de moda urbana a nivel nacional,
                reconocida por nuestra innovación en diseños, calidad excepcional y por
                construir una comunidad alrededor de la cultura urbana y la autoexpresión.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
              Nuestros Valores
            </span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: '✨',
                title: 'Calidad Premium',
                description: 'Utilizamos sólo los mejores materiales y procesos de producción para garantizar durabilidad y comodidad.',
                color: 'from-[#60caba] to-[#58b7a9]'
              },
              {
                icon: '🎨',
                title: 'Creatividad',
                description: 'Diseños originales que reflejan las últimas tendencias de la moda urbana contemporánea.',
                color: 'from-[#FFD700] to-[#E6C600]'
              },
              {
                icon: '🌱',
                title: 'Sostenibilidad',
                description: 'Comprometidos con procesos de producción responsables y materiales ecológicos.',
                color: 'from-[#ec4899] to-[#be185d]'
              }
            ].map((value, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center group hover:bg-white/10 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  {value.icon}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3">
                  {value.title}
                </h3>
                
                <p className="text-gray-300">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION FINAL */}
      <section className="py-20 bg-gradient-to-br from-[#60caba]/20 via-[#FFD700]/10 to-[#60caba]/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#60caba]/5 via-transparent to-[#FFD700]/5"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
                  ¿Listo para encontrar tu estilo?
                </span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Únete a miles de clientes satisfechos y descubre por qué somos la mejor opción para
                expresar tu personalidad a través de la moda urbana. Tu próxima camiseta favorita te está esperando.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="group bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black px-8 py-4 rounded-2xl font-bold hover:from-[#58b7a9] hover:to-[#E6C600] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>👕 Explorar Colección</span>
                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
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
                className="bg-white/10 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all duration-200 border border-white/20 hover:border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>💬 Contáctanos</span>
              </Link>
            </div>

            <div className="mt-8 text-sm text-gray-400">
              <p>🔒 Compra 100% segura • 🚚 Envío gratis • ↩️ Devoluciones fáciles</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;