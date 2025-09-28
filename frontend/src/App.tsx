// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/common/ScrollToTop';

// Páginas de tienda
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FavoritesPage from './pages/FavoritesPage';

// ===== PÁGINAS DE SOPORTE =====
import HelpCenterPage from './pages/HelpCenterPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

// Páginas de autenticación
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ProfilePage from './pages/ProfilePage';
// ===== NUEVAS PÁGINAS AÑADIDAS =====
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// ===== PÁGINAS DE PAGO (NUEVAS) =====
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';

// Páginas de Admin
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Users from './pages/admin/Users';
import AddProductForm from './pages/admin/AddProductForm';
import Reviews from './pages/admin/Reviews';
import Messages from './pages/admin/Messages';

// Componentes para rutas protegidas
import PrivateRoute from './components/auth/PrivateRoute';
import UserPrivateRoute from './components/auth/UserPrivateRoute';

const NotFoundPage: React.FC = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {/* Contenido de 404 */}
    </div>
);

const AppContent: React.FC = () => {
  const navigate = useNavigate();

  const handleAddProductSuccess = () => {
    navigate('/admin/products');
  };

  return (
    <Routes>
      {/* Layout de la tienda */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
      <Route path="/product/:id" element={<Layout><ProductDetailPage /></Layout>} />
      <Route path="/cart" element={<Layout><CartPage /></Layout>} />
      <Route path="/about" element={<Layout><AboutPage /></Layout>} />
      <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
      <Route path="/favorites" element={<Layout><FavoritesPage /></Layout>} />
      
      {/* Rutas de Soporte */}
      <Route path="/help-center" element={<Layout><HelpCenterPage /></Layout>} />
      <Route path="/terms-of-service" element={<Layout><TermsOfServicePage /></Layout>} />
      <Route path="/privacy-policy" element={<Layout><PrivacyPolicyPage /></Layout>} />

      {/* Rutas de Autenticación Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      {/* ===== RUTAS NUEVAS AÑADIDAS AQUÍ ===== */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      {/* ===================================== */}

      {/* --- RUTA PROTEGIDA PARA USUARIOS LOGUEADOS --- */}
      <Route element={<UserPrivateRoute />}>
        <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
        {/* ===== RUTAS DE PAGO AÑADIDAS AQUÍ ===== */}
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment-failure" element={<PaymentFailurePage />} />
        {/* ======================================= */}
      </Route>
      {/* ----------------------------------------------- */}

      {/* Sección Admin (Protegida por Rol) */}
      <Route element={<PrivateRoute requiredRole="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="users" element={<Users />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="messages" element={<Messages />} />
          <Route path="add-product" element={<AddProductForm onSuccess={handleAddProductSuccess} />} />
        </Route>
      </Route>

      {/* Página 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

const App: React.FC = () => {
    return (
    <AuthProvider>
        <CartProvider>
            <FavoritesProvider>
                <NotificationProvider>
                    <Router>
                        <ScrollToTop />
                        <AppContent />
                    </Router>
                </NotificationProvider>
            </FavoritesProvider>
        </CartProvider>
    </AuthProvider>
  );
};

export default App;