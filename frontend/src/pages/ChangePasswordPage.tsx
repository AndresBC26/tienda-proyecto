// src/pages/ChangePasswordPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

const ChangePasswordPage: React.FC = () => {
  const { notify } = useNotification();
  const navigate = useNavigate();
  const { user } = useAuth(); // Para verificar si usa Google Login

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = formData;

    if (newPassword.length < 6) {
      notify('La nueva contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      notify('Las nuevas contraseñas no coinciden.', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await axios.put(
        `${apiUrl}/api/users/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      notify(response.data.message, 'success');
      setTimeout(() => navigate('/profile'), 2000);

    } catch (err: any) {
      notify(err.response?.data?.message || 'Error al actualizar la contraseña.', 'error');
    } finally {
      setLoading(false);
    }
  };

   // Si el usuario está logueado con Google y no tiene contraseña, no debería estar aquí.
  if (user && !user.hasPassword) {
      return (
          <Layout>
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] text-white">
                  <div className="text-center p-8 bg-white/5 rounded-2xl max-w-md">
                      <h2 className="text-2xl font-bold mb-4">No se puede cambiar la contraseña</h2>
                      <p className="text-gray-400 mb-6">Iniciaste sesión con Google y no tienes una contraseña local para cambiar.</p>
                      <Link to="/profile" className="font-medium text-[#60caba] hover:text-[#FFD700]">Volver al Perfil</Link>
                  </div>
              </div>
          </Layout>
      );
  }

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] py-20">
        <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 p-8 rounded-2xl shadow-lg border border-white/10 w-full max-w-sm backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
            Cambiar Contraseña
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300">Contraseña Actual</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Nueva Contraseña</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-2xl text-black bg-gradient-to-r from-[#60caba] to-[#FFD700] disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
           <div className="mt-6 text-center text-sm text-gray-400">
                <Link to="/profile" className="font-medium text-[#60caba] hover:text-[#FFD700]">
                    ← Volver al Perfil
                </Link>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChangePasswordPage;