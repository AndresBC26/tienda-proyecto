// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import Layout from './components/layout/Layout';

// Páginas de tienda
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Páginas de Admin
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Users from './pages/admin/Users';


// Componente 404
const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-32 h-32 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-8">
        <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Página No Encontrada</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Lo sentimos, la página que buscas no existe o ha sido movida a otra ubicación.
      </p>
      <div className="space-y-4">
        <a
          href="/"
          className="inline-block bg-[#5FCDD9] hover:bg-[#04BFAD] text-[#172026] font-bold py-3 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          🏠 Volver al Inicio
        </a>
        <div className="block">
          <a
            href="/products"
            className="inline-block bg-white border-2 border-[#5FCDD9] text-[#027373] hover:bg-[#5FCDD9] hover:text-[#172026] font-bold py-3 px-8 rounded-2xl transition-all duration-200"
          >
            🛍️ Ver Productos
          </a>
        </div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Layout de la tienda */}
          <Route
            path="/"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />
          <Route
            path="/products"
            element={
              <Layout>
                <ProductsPage />
              </Layout>
            }
          />
          <Route
            path="/product/:id"
            element={
              <Layout>
                <ProductDetailPage />
              </Layout>
            }
          />
          <Route
            path="/cart"
            element={
              <Layout>
                <CartPage />
              </Layout>
            }
          />
          <Route
            path="/about"
            element={
              <Layout>
                <AboutPage />
              </Layout>
            }
          />
          <Route
            path="/contact"
            element={
              <Layout>
                <ContactPage />
              </Layout>
            }
          />

          {/* Sección Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="users" element={<Users />} />
          </Route>

          {/* Página 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </CartProvider>
  );
};

export default App;
