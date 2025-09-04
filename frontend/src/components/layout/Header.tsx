// src/components/layout/Header.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import logo from '../../assets/ELEGANCIA URBAN (1).png';

const Header: React.FC = () => {
  const { state: cartState } = useCart();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-gradient-to-r from-[#0f0f0f]/80 via-[#1a1a1a]/70 to-[#0f0f0f]/80 border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-3 group -ml-2">
            <div className="relative">
              <img 
                src={logo} 
                alt="Logo Tienda" 
                className="w-16 h-16 rounded-2xl shadow-[0_0_15px_#60caba99] group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-extrabold tracking-wide bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
                Mi Tienda
              </h1>
              <p className="text-xs text-gray-400 -mt-1">"El arte de vestir la ciudad"</p>
            </div>
          </Link>

          {/* BARRA DE BÚSQUEDA */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl
                focus:bg-black/40 focus:ring-2 focus:ring-[#60caba] focus:outline-none 
                transition-all duration-300 text-gray-200 placeholder-gray-400"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* NAVEGACIÓN */}
          <nav className="hidden lg:flex items-center space-x-2">
            {[
              { path: '/', label: 'Inicio' },
              { path: '/products', label: 'Productos' },
              { path: '/about', label: 'Nosotros' },
              { path: '/contact', label: 'Contacto' }
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-5 py-2 rounded-xl font-medium text-sm tracking-wide transition-all duration-300 ${
                  isActive(path)
                    ? 'bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black shadow-lg shadow-[#60caba66]'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* DERECHA */}
          <div className="flex items-center space-x-4">
            
            {/* Favoritos */}
            <button className="p-2 text-gray-400 hover:text-pink-500 transition relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            {/* Carrito */}
            <Link to="/cart" className="relative group">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black px-4 py-3 rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_#60caba99]">
                <div className="relative">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 4H19m-10-4v6a2 2 0 104 0v-6m-4 0h4" />
                  </svg>
                  {cartState.itemCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-black text-[#60caba] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-ping">
                      {cartState.itemCount}
                    </div>
                  )}
                </div>
                <div className="hidden sm:block">
                  <span className="font-semibold">Carrito</span>
                  {cartState.total > 0 && (
                    <p className="text-xs text-gray-800 -mt-1">
                      ${cartState.total.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </Link>

            {/* Menú móvil */}
            <button className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN MÓVIL */}
        <nav className="lg:hidden mt-4 flex justify-center space-x-2 overflow-x-auto pb-2">
          {[
            { path: '/', label: 'Inicio', icon: '🏠' },
            { path: '/products', label: 'Productos', icon: '🛍️' },
            { path: '/cart', label: 'Carrito', icon: '🛒' },
            { path: '/about', label: 'Nosotros', icon: '🏢' },
            { path: '/contact', label: 'Contacto', icon: '📞' }
          ].map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center px-3 py-2 rounded-xl min-w-0 flex-shrink-0 transition-all duration-200 ${
                isActive(path)
                  ? 'bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-lg mb-1">{icon}</span>
              <span className="text-xs font-medium whitespace-nowrap">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;



