// src/pages/ProfilePage.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Loading from '../components/common/Loading';

const ProfilePage: React.FC = () => {
  // Se elimina la función `handleLogout` de aquí ya que no se usa en esta página
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] flex items-center justify-center">
        <Loading message="Cargando perfil..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl text-gray-300 mb-4">No se pudo cargar la información del usuario.</p>
          <Link to="/login" className="text-lg font-bold text-black bg-gradient-to-r from-[#60caba] to-[#FFD700] px-6 py-3 rounded-xl">
            Ir a Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] py-12 text-white">
      <div className="container mx-auto px-6">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent mb-2">
            Mi Cuenta
          </h1>
          <p className="text-gray-400">Administra tu información personal y preferencias.</p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Panel de Navegación */}
          <aside className="md:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-3">
              <Link to="/profile" className="flex items-center space-x-3 px-4 py-3 bg-white/10 rounded-lg text-white font-semibold">
                <span>👤</span>
                <span>Datos Personales</span>
              </Link>
              <Link to="/favorites" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                <span>❤️</span>
                <span>Mis Favoritos</span>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                  <span>👑</span>
                  <span>Panel de Admin</span>
                </Link>
              )}
              {/* ===== CAMBIO AQUÍ: Se eliminó el botón de Cerrar Sesión ===== */}
            </div>
          </aside>

          {/* Contenido Principal */}
          <main className="md:col-span-2">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Datos Personales</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-400">Nombre Completo</label>
                  <p className="mt-1 text-lg text-gray-200 p-3 bg-black/20 rounded-lg border border-white/10">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Correo Electrónico</label>
                  <p className="mt-1 text-lg text-gray-200 p-3 bg-black/20 rounded-lg border border-white/10">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Rol de Usuario</label>
                  <p className="mt-1 text-lg text-gray-200 p-3 bg-black/20 rounded-lg border border-white/10 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;