// src/components/layout/Footer.tsx
import React from 'react';
import { brandConfig } from '../../utils/brandConfig';
import { Link } from 'react-router-dom';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] border-t border-white/10 ${className}`}>
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

            {/* REDES SOCIALES CON ICONOS SVG */}
            <div className="flex space-x-4">
              <a
                href={brandConfig.social.facebook}
                className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-gradient-to-r hover:from-[#60caba] hover:to-[#FFD700] hover:text-black transition-all duration-300 transform hover:scale-105"
                title="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z" /></svg>
              </a>
              <a
                href={brandConfig.social.instagram}
                className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-gradient-to-r hover:from-[#60caba] hover:to-[#FFD700] hover:text-black transition-all duration-300 transform hover:scale-105"
                title="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.058-1.689-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z" /></svg>
              </a>
              <a
                href={brandConfig.social.twitter}
                className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-gradient-to-r hover:from-[#60caba] hover:to-[#FFD700] hover:text-black transition-all duration-300 transform hover:scale-105"
                title="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.298 1.634 4.212 3.793 4.649-.418.113-.863.173-1.325.173-.305 0-.602-.03-.893-.086.608 1.883 2.372 3.256 4.465 3.293-1.622 1.272-3.666 2.029-5.88 2.029-.383 0-.761-.022-1.132-.066 2.099 1.353 4.604 2.145 7.333 2.145 8.791 0 13.597-7.29 13.597-13.597 0-.207-.005-.412-.013-.617.934-.675 1.748-1.513 2.393-2.48z" /></svg>
              </a>
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

          {/* COLUMNA 3: INFORMACIÓN DE CONTACTO (RESTAURADA) */}
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

        {/* LÍNEA SEPARADORA Y COPYRIGHT (RESTAURADO) */}
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
  );
};

export default Footer;