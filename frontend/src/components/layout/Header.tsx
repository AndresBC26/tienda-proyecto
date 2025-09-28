// src/components/layout/Header.tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/ELEGANCIA URBAN (1).png';

const Header: React.FC = () => {
  const { state: cartState } = useCart();
  const { state: favoritesState } = useFavorites();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="relative z-50 w-full backdrop-blur-lg bg-gradient-to-r from-[#0b0b0b]/95 via-[#151515]/90 to-[#0b0b0b]/95 border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-3 py-5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img
                  src={logo}
                  alt="Logo Tienda"
                  className="w-12 h-12 rounded-2xl shadow-[0_0_15px_#60caba99] group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-extrabold tracking-wide bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
                  Mi Tienda
                </h1>
                <p className="text-xs text-gray-300 -mt-1">"El arte de vestir la ciudad"</p>
              </div>
            </Link>
          </div>

          {/* Nav + acciones */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Desktop Navigation */}
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
                  className={`px-4 py-2 rounded-xl font-medium text-sm tracking-wide transition-all duration-300 whitespace-nowrap ${
                    isActive(path)
                      ? 'bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black shadow-lg shadow-[#60caba66]'
                      : 'text-gray-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* User Actions - ✅ CORRECCIÓN APLICADA AQUÍ */}
            <div className="hidden lg:flex items-center gap-3">
              {/* User Authentication */}
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#60caba] hidden md:inline whitespace-nowrap">
                    Hola, {user.name}
                  </span>
                  
                  <Link to="/profile" className="p-2 text-gray-200 hover:text-white transition relative flex-shrink-0" title="Mi Cuenta">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>
                  
                  <div
                    onClick={handleLogout}
                    className="p-2 transition cursor-pointer flex-shrink-0 text-gray-200 hover:text-red-400"
                    title="Cerrar Sesión"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="p-2 text-gray-200 hover:text-white transition relative flex-shrink-0" title="Iniciar Sesión">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )}

              {/* Favorites */}
              <Link to="/favorites" className="p-2 text-gray-200 hover:text-pink-500 transition relative flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {favoritesState.count > 0 && (
                  <span className="absolute top-1 right-1 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {favoritesState.count}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative group flex-shrink-0">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-[#60caba] to-[#FFD700] px-4 py-2 rounded-2xl shadow-lg shadow-[#60caba66] text-black font-semibold hover:from-[#58b7a9] hover:to-[#E6C600] transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5.4M7 13l-1.5 4H19m-10-4v6a2 2 0 104 0v-6m-4 0h4" />
                  </svg>
                  <span className="text-sm">{cartState.itemCount}</span>
                  <span className="text-sm hidden xl:inline whitespace-nowrap">Carrito</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="lg:hidden mt-4 flex justify-start md:justify-center space-x-2 overflow-x-auto pb-2">
          {[
            { path: '/', label: 'Inicio', icon: '🏠' },
            { path: '/products', label: 'Productos', icon: '🛍️' },
            { path: '/cart', label: 'Carrito', icon: '🛒' },
            { path: '/about', label: 'Nosotros', icon: '🏢' },
            { path: '/contact', label: 'Contacto', icon: '📞' },
            { path: '/favorites', label: 'Favoritos', icon: '❤️' }
          ].map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center px-3 py-2 rounded-xl min-w-0 flex-shrink-0 transition-all duration-200 ${
                isActive(path)
                  ? 'bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black shadow-md'
                  : 'text-gray-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-lg mb-1">{icon}</span>
              <span className="text-xs font-medium whitespace-nowrap">{label}</span>
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to="/profile"
                className={`flex flex-col items-center px-3 py-2 rounded-xl min-w-0 flex-shrink-0 transition-all duration-200 ${
                  isActive('/profile')
                    ? 'bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black shadow-md'
                    : 'text-gray-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-lg mb-1">👤</span>
                <span className="text-xs font-medium whitespace-nowrap">Cuenta</span>
              </Link>
              <div
                onClick={handleLogout}
                className="flex flex-col items-center px-3 py-2 rounded-xl min-w-0 flex-shrink-0 transition-all duration-200 cursor-pointer text-gray-200 hover:text-red-500 hover:bg-white/10"
              >
                <span className="text-lg mb-1">🚪</span>
                <span className="text-xs font-medium whitespace-nowrap">Salir</span>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className={`flex flex-col items-center px-3 py-2 rounded-xl min-w-0 flex-shrink-0 transition-all duration-200 ${
                isActive('/login')
                  ? 'bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black shadow-md'
                  : 'text-gray-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-lg mb-1">👤</span>
              <span className="text-xs font-medium whitespace-nowrap">Login</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;