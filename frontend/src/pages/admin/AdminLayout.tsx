// src/pages/admin/AdminLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// Componente para el punto de notificación
const NotificationDot = () => (
  <span className="absolute top-1/2 right-2 -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-[#60caba] to-[#FFD700] rounded-full animate-pulse"></span>
);

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, loading: authLoading } = useAuth();
  
  const [hasNewUsers, setHasNewUsers] = useState(false);
  const [hasNewReviews, setHasNewReviews] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  
  const [userCount, setUserCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

        const [usersRes, reviewsRes, messagesRes] = await Promise.all([
          axios.get(`${API_URL}/api/users`, { headers }),
          axios.get(`${API_URL}/api/reviews`, { headers }),
          axios.get(`${API_URL}/api/contact`, { headers }),
        ]);

        const currentUsers = usersRes.data.length;
        const currentReviews = reviewsRes.data.length;
        const currentMessages = messagesRes.data.length;

        setUserCount(currentUsers);
        setReviewCount(currentReviews);
        setMessageCount(currentMessages);

        const seenUsersCount = parseInt(localStorage.getItem('seenUsersCount') || '0');
        const seenReviewsCount = parseInt(localStorage.getItem('seenReviewsCount') || '0');
        const seenMessagesCount = parseInt(localStorage.getItem('seenMessagesCount') || '0');

        if (currentUsers > seenUsersCount) setHasNewUsers(true);
        if (currentReviews > seenReviewsCount) setHasNewReviews(true);
        if (currentMessages > seenMessagesCount) setHasNewMessages(true);

      } catch (error) {
        console.error("Error al verificar notificaciones:", error);
      }
    };

    checkNotifications();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleSeeUsers = () => {
    setHasNewUsers(false);
    localStorage.setItem('seenUsersCount', userCount.toString());
  };
  const handleSeeReviews = () => {
    setHasNewReviews(false);
    localStorage.setItem('seenReviewsCount', reviewCount.toString());
  };
  const handleSeeMessages = () => {
    setHasNewMessages(false);
    localStorage.setItem('seenMessagesCount', messageCount.toString());
  };

  const getLinkClass = (path: string) =>
    `relative block px-4 py-2 rounded-xl transition duration-200 text-sm font-medium ${
      location.pathname === path || (path === '/admin' && location.pathname === '/admin')
        ? 'bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black shadow-lg'
        : 'hover:bg-white/10 text-gray-300 hover:text-white'
    }`;
  
  const logoutClass = `block px-4 py-2 rounded-xl transition duration-200 mt-auto hover:bg-red-500/20 text-gray-300 hover:text-red-300`;

  return (
    // ✅ CORRECCIÓN 1: Se asegura que el contenedor principal ocupe toda la pantalla y sea flexible.
    <div className="min-h-screen flex bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b]">
      <aside className="w-64 bg-black/30 text-white p-6 space-y-4 flex flex-col border-r border-white/10">
        <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
          🛍️ Admin Panel
        </h1>
        <nav className="space-y-2 flex-1">
          <Link to="/admin" className={getLinkClass('/admin')}>
            📊 Dashboard
          </Link>
          <Link to="/admin/products" className={getLinkClass('/admin/products')}>
            👕 Productos
          </Link>
          <Link to="/admin/users" className={getLinkClass('/admin/users')} onClick={handleSeeUsers}>
            👤 Usuarios
            {hasNewUsers && <NotificationDot />}
          </Link>
          <Link to="/admin/reviews" className={getLinkClass('/admin/reviews')} onClick={handleSeeReviews}>
            💬 Reseñas
            {hasNewReviews && <NotificationDot />}
          </Link>
          <Link to="/admin/messages" className={getLinkClass('/admin/messages')} onClick={handleSeeMessages}>
            📥 Mensajes
            {hasNewMessages && <NotificationDot />}
          </Link>
        </nav>
        <button
          onClick={handleLogout}
          className={logoutClass}
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar Sesión</span>
          </div>
        </button>
      </aside>
      
      {/* ✅ CORRECCIÓN 2: Se hace que el área de contenido principal se expanda. */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        {authLoading ? (
          <div className="flex flex-1 items-center justify-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#60caba]"></div>
          </div>
        ) : (
          <div className="flex-1 p-6 text-white">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminLayout;