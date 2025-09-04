// src/components/layout/Footer.tsx
import React from 'react';
import { brandConfig } from '../../utils/brandConfig';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#172026] border-t border-[#027373]">
      <div className="container mx-auto px-6 py-12">
        {/* CONTENIDO PRINCIPAL DEL FOOTER */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* COLUMNA 1: INFORMACIÓN DE LA EMPRESA */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#5FCDD9] to-[#04BFAD] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">{brandConfig.logo.icon}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{brandConfig.name}</h3>
                <p className="text-sm text-[#5FCDD9]">{brandConfig.slogan}</p>
              </div>
            </div>
            <p className="text-[#D1D5DB] leading-relaxed mb-6 max-w-md">
              {brandConfig.company.description}
            </p>

            {/* REDES SOCIALES ACTUALIZADAS */}
            <div className="flex space-x-4">
              <a
                href={brandConfig.social.facebook}
                className="w-10 h-10 bg-[#027373] rounded-xl flex items-center justify-center text-[#5FCDD9] hover:text-white transition-all duration-200 hover:bg-[#04BFAD] transform hover:scale-105"
              >
                <span className="text-lg">📘</span>
              </a>
              <a
                href={brandConfig.social.instagram}
                className="w-10 h-10 bg-[#027373] rounded-xl flex items-center justify-center text-[#5FCDD9] hover:text-white transition-all duration-200 hover:bg-[#04BF9D] transform hover:scale-105"
              >
                <span className="text-lg">📷</span>
              </a>
              <a
                href={brandConfig.social.twitter}
                className="w-10 h-10 bg-[#027373] rounded-xl flex items-center justify-center text-[#5FCDD9] hover:text-white transition-all duration-200 hover:bg-[#5FCDD9] transform hover:scale-105"
              >
                <span className="text-lg">🐦</span>
              </a>
            </div>
          </div>

          {/* COLUMNA 2: ENLACES RÁPIDOS */}
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
                    className="text-[#5FCDD9] hover:text-[#04BFAD] transition-colors duration-200 hover:translate-x-1 transform inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* ENLACES ADICIONALES */}
            <h5 className="text-md font-semibold text-white mt-8 mb-4">Soporte</h5>
            <ul className="space-y-2">
              {['Centro de Ayuda', 'Términos de Servicio', 'Política de Privacidad'].map(item => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-[#5FCDD9] hover:text-[#04BFAD] transition-colors duration-200 text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMNA 3: INFORMACIÓN DE CONTACTO */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-[#027373] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm text-white">📍</span>
              </div>
              <div>
                <h6 className="font-medium text-white text-sm">Dirección</h6>
                <p className="text-[#5FCDD9] text-sm">
                  {brandConfig.contact.address.street}
                  <br />
                  {brandConfig.contact.address.city}, {brandConfig.contact.address.country}
                  <br />
                  {brandConfig.contact.address.zipCode}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-[#027373] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm text-white">📞</span>
              </div>
              <div>
                <h6 className="font-medium text-white text-sm">Teléfono</h6>
                <p className="text-[#5FCDD9] text-sm">{brandConfig.contact.phone}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-[#027373] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm text-white">✉️</span>
              </div>
              <div>
                <h6 className="font-medium text-white text-sm">Email</h6>
                <p className="text-[#5FCDD9] text-sm">{brandConfig.contact.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* LÍNEA SEPARADORA */}
        <div className="border-t border-[#027373] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* COPYRIGHT */}
            <div className="text-center md:text-left">
              <p className="text-[#5FCDD9] text-sm">
                &copy; 2025 InnoVibe. Todos los derechos reservados.
              </p>
              <p className="text-[#04BFAD] text-xs mt-1">
                Desarrollado con ❤️ usando React + TypeScript + TailwindCSS
              </p>
            </div>

            {/* BADGES DE CONFIANZA */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-[#027373] px-3 py-2 rounded-lg">
                <span className="text-[#04BF9D]">🔒</span>
                <span className="text-xs font-medium text-white">Compra Segura</span>
              </div>
              <div className="flex items-center space-x-2 bg-[#027373] px-3 py-2 rounded-lg">
                <span className="text-[#5FCDD9]">🚚</span>
                <span className="text-xs font-medium text-white">Envío Gratis</span>
              </div>
              <div className="flex items-center space-x-2 bg-[#027373] px-3 py-2 rounded-lg">
                <span className="text-[#04BFAD]">⭐</span>
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
