// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Loading from '../components/common/Loading';
import { useNotification } from '../contexts/NotificationContext';
import axios from 'axios';

const ProfilePage: React.FC = () => {
  const { user, loading, updateUserData } = useAuth();
  const { notify } = useNotification();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancel = () => {
    if (user) {
      setFormData({ name: user.name, email: user.email });
    }
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await axios.put(
        `${API_URL}/api/users/${user._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      updateUserData(response.data); 

      notify('¡Perfil actualizado exitosamente!', 'success');
      setIsEditing(false);
    } catch (err: any) {
      notify(err.response?.data?.message || 'Error al actualizar el perfil.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    // ✅ CORRECCIÓN: Se eliminó la clase `min-h-[calc(...)]` de aquí
    <div className="bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] py-12 text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent mb-2">
            Mi Cuenta
          </h1>
          <p className="text-gray-400">Administra tu información personal y preferencias.</p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <aside className="md:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-3">
              <div className="flex items-center space-x-3 px-4 py-3 bg-white/10 rounded-lg text-white font-semibold">
                <span>👤</span>
                <span>Datos Personales</span>
              </div>
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
            </div>
          </aside>

          <main className="md:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Datos Personales</h2>
                  {!isEditing && (
                    <button type="button" onClick={() => setIsEditing(true)} className="bg-white/10 hover:bg-white/20 text-gray-200 font-semibold py-2 px-4 rounded-xl transition-all duration-200">
                      Editar
                    </button>
                  )}
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Nombre Completo</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 w-full text-lg p-3 bg-black/40 rounded-lg border border-white/20 focus:ring-2 focus:ring-[#60caba] focus:outline-none"
                      />
                    ) : (
                      <p className="mt-1 text-lg text-gray-200 p-3 bg-black/20 rounded-lg border border-white/10">{user.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Correo Electrónico</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 w-full text-lg p-3 bg-black/40 rounded-lg border border-white/20 focus:ring-2 focus:ring-[#60caba] focus:outline-none"
                      />
                    ) : (
                      <p className="mt-1 text-lg text-gray-200 p-3 bg-black/20 rounded-lg border border-white/10">{user.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Rol de Usuario</label>
                    <p className="mt-1 text-lg text-gray-200 p-3 bg-black/20 rounded-lg border border-white/10 capitalize cursor-not-allowed">{user.role}</p>
                  </div>
                </div>
                {isEditing && (
                  <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={handleCancel} className="bg-white/10 hover:bg-white/20 text-gray-200 font-semibold py-2 px-5 rounded-xl transition-all duration-200">
                      Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black font-bold py-2 px-5 rounded-xl hover:from-[#58b7a9] hover:to-[#E6C600] transition-all duration-300 disabled:opacity-50">
                      {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;