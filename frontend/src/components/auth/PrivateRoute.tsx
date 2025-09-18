import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../common/Loading';

interface PrivateRouteProps {
  requiredRole: 'admin' | 'user' | 'moderator';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // 🔄 Mientras se valida la sesión, muestra pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] flex items-center justify-center">
        <Loading message="Verificando acceso..." />
      </div>
    );
  }

  // ✅ Cuando terminó la validación y está autenticado y con rol correcto
  if (isAuthenticated && user?.role === requiredRole) {
    return <Outlet />;
  }

  // 🚫 No autenticado o rol incorrecto
  return <Navigate to="/login" replace />;
};

export default PrivateRoute;
