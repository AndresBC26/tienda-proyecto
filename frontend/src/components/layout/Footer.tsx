// src/components/layout/Footer.tsx
import React, { useState, useEffect } from 'react';
import { brandConfig } from '../../utils/brandConfig';
import { Link } from 'react-router-dom';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Detectar scroll para mostrar/ocultar botón
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Función para volver arriba
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <footer className={`bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] ${className}`}>
        <div className="container mx-auto px-6 py-12">
          {/* CONTENIDO PRINCIPAL DEL FOOTER */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* COLUMNA 1: INFORMACIÓN DE LA EMPRESA */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-[#60caba] to-[#FFD700] rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold text-black">{brandConfig.logo.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{brandConfig.name}</h3>
                  <p className="text-sm text-[#60caba]">{brandConfig.slogan}</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
                {brandConfig.company.description}
              </p>

              {/* REDES SOCIALES CON ICONOS MEJORADOS */}
              <div className="flex space-x-3 mb-8">
                {/* Facebook */}
                <a
                  href={brandConfig.social.facebook}
                  className="group relative w-11 h-11 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white/80 hover:border-[#1877F2]/50 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-lg hover:shadow-[#1877F2]/20"
                  title="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5 group-hover:text-[#1877F2] transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1877F2]/0 to-[#1877F2]/0 group-hover:from-[#1877F2]/10 group-hover:to-[#1877F2]/5 rounded-2xl transition-all duration-300"></div>
                </a>

                {/* Instagram */}
                <a
                  href={brandConfig.social.instagram}
                  className="group relative w-11 h-11 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white/80 hover:border-[#E4405F]/50 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-lg hover:shadow-[#E4405F]/20"
                  title="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5 group-hover:text-[#E4405F] transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#E4405F]/0 to-[#E4405F]/0 group-hover:from-[#E4405F]/10 group-hover:to-[#E4405F]/5 rounded-2xl transition-all duration-300"></div>
                </a>

                {/* TikTok */}
                <a
                  href={brandConfig.social.tiktok}
                  className="group relative w-11 h-11 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white/80 hover:border-[#00f2ea]/50 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-lg hover:shadow-[#00f2ea]/20"
                  title="TikTok"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5 group-hover:text-[#00f2ea] transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00f2ea]/0 to-[#00f2ea]/0 group-hover:from-[#00f2ea]/10 group-hover:to-[#00f2ea]/5 rounded-2xl transition-all duration-300"></div>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${brandConfig.contact.phone.replace(/\D/g, '')}`}
                  className="group relative w-11 h-11 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white/80 hover:border-[#25D366]/50 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-lg hover:shadow-[#25D366]/20"
                  title="WhatsApp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5 group-hover:text-[#25D366] transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#25D366]/0 to-[#25D366]/0 group-hover:from-[#25D366]/10 group-hover:to-[#25D366]/5 rounded-2xl transition-all duration-300"></div>
                </a>
              </div>

              {/* MÉTODOS DE PAGO */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-[#60caba]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Métodos de Pago Seguros
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Mercado Pago */}
                  <div className="group relative bg-white px-3 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    <svg className="h-5" viewBox="0 0 200 50" fill="none">
                      <path d="M40 10h-15c-2.8 0-5 2.2-5 5v20c0 2.8 2.2 5 5 5h15c2.8 0 5-2.2 5-5V15c0-2.8-2.2-5-5-5z" fill="#009EE3"/>
                      <path d="M35 18c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm0 11c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" fill="white"/>
                      <text x="52" y="32" fill="#333" fontSize="16" fontWeight="600" fontFamily="Arial">Mercado Pago</text>
                    </svg>
                  </div>

                  {/* PSE */}
                  <div className="bg-white px-3 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    <span className="text-[#00A859] font-bold text-sm">PSE</span>
                  </div>

                  {/* Visa */}
                  <div className="bg-white px-3 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    <svg className="h-4" viewBox="0 0 48 16" fill="none">
                      <path d="M0 8c0-4.4 3.6-8 8-8h32c4.4 0 8 3.6 8 8s-3.6 8-8 8H8c-4.4 0-8-3.6-8-8z" fill="#1A1F71"/>
                      <text x="8" y="11" fill="white" fontSize="10" fontWeight="700" fontFamily="Arial">VISA</text>
                    </svg>
                  </div>

                  {/* Mastercard */}
                  <div className="bg-white px-2 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    <svg className="h-5" viewBox="0 0 48 30" fill="none">
                      <circle cx="15" cy="15" r="12" fill="#EB001B"/>
                      <circle cx="33" cy="15" r="12" fill="#F79E1B"/>
                      <path d="M24 7.5c-2.5 2-4 5-4 8.5s1.5 6.5 4 8.5c2.5-2 4-5 4-8.5s-1.5-6.5-4-8.5z" fill="#FF5F00"/>
                    </svg>
                  </div>

                  {/* Nequi */}
                  <div className="bg-[#4B0082] px-3 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    <span className="text-white font-bold text-xs">Nequi</span>
                  </div>

                  {/* Efecty */}
                  <div className="bg-[#FF0000] px-3 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    <span className="text-white font-bold text-xs">Efecty</span>
                  </div>
                </div>
                <p className="text-gray-400 text-xs mt-2 flex items-center">
                  <svg className="w-3 h-3 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Pagos 100% seguros procesados por Mercado Pago
                </p>
              </div>
            </div>

            {/* COLUMNA 2: ENLACES RÁPIDOS Y SOPORTE */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Enlaces Rápidos</h4>
              <ul className="space-y-3">
                {[
                  { to: '/', label: 'Inicio' },
                  { to: '/products', label: 'Productos' },
                  { to: '/about', label: 'Nosotros' },
                  { to: '/contact', label: 'Contacto' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-gray-400 hover:text-[#60caba] transition-colors duration-300 hover:translate-x-1 transform inline-block"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>

              <h5 className="text-md font-semibold text-white mt-8 mb-4">Soporte</h5>
              <ul className="space-y-2">
                {[
                  { to: '/help-center', label: 'Centro de Ayuda' },
                  { to: '/terms-of-service', label: 'Términos de Servicio' },
                  { to: '/privacy-policy', label: 'Política de Privacidad' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-gray-400 hover:text-[#60caba] transition-colors duration-300 text-sm"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMNA 3: INFORMACIÓN DE CONTACTO */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm text-[#60caba]">📍</span>
                </div>
                <div>
                  <h6 className="font-medium text-white text-sm">Dirección</h6>
                  <p className="text-gray-400 text-sm">
                    {brandConfig.contact.address.street}
                    <br />
                    {brandConfig.contact.address.city}, {brandConfig.contact.address.country}
                    <br />
                    {brandConfig.contact.address.zipCode}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm text-[#60caba]">📞</span>
                </div>
                <div>
                  <h6 className="font-medium text-white text-sm">Teléfono</h6>
                  <p className="text-gray-400 text-sm">{brandConfig.contact.phone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm text-[#60caba]">✉️</span>
                </div>
                <div>
                  <h6 className="font-medium text-white text-sm">Email</h6>
                  <p className="text-gray-400 text-sm">{brandConfig.contact.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* LÍNEA SEPARADORA Y COPYRIGHT */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* COPYRIGHT */}
              <div className="text-center md:text-left">
                <p className="text-gray-400 text-sm">
                  &copy; 2025 Elegancia Urban. Todos los derechos reservados.
                </p>
                <p className="text-[#60caba] text-xs mt-1">
                  Desarrollado con ❤️ usando React + TypeScript + TailwindCSS
                </p>
              </div>

              {/* BADGES DE CONFIANZA */}
              <div className="flex flex-wrap justify-center items-center gap-3">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-2 rounded-xl">
                  <span className="text-[#60caba]">🔒</span>
                  <span className="text-xs font-medium text-white">Compra Segura</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-2 rounded-xl">
                  <span className="text-[#FFD700]">🚚</span>
                  <span className="text-xs font-medium text-white">Envío Gratis</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-2 rounded-xl">
                  <span className="text-[#ec4899]">⭐</span>
                  <span className="text-xs font-medium text-white">99.8% Satisfacción</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;