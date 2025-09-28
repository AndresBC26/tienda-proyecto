// src/pages/ResetPasswordPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import { useNotification } from '../contexts/NotificationContext';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ===== ESTADOS AÑADIDOS PARA EL 'OJITO' =====
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // ===========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      notify('La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      notify('Las contraseñas no coinciden.', 'error');
      return;
    }
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.put(`${apiUrl}/api/users/reset-password/${token}`, { password });
      notify(response.data.message, 'success');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any)      {
      notify(err.response?.data?.message || 'Error al restablecer la contraseña.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] py-20">
        <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 p-8 rounded-2xl shadow-lg border border-white/10 w-full max-w-sm backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
            Establecer Nueva Contraseña
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ===== CAMPO DE NUEVA CONTRASEÑA MODIFICADO ===== */}
            <div>
              <label className="block text-sm font-medium text-gray-300">Nueva Contraseña</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#60caba] pr-10"
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.789 9.789 0 011.026-2.317m2.261-2.261C7.818 7.377 9.814 7 12 7c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-1.293 2.923m-4.42-4.42L11 11" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* ===== CAMPO DE CONFIRMAR CONTRASEÑA MODIFICADO ===== */}
            <div>
              <label className="block text-sm font-medium text-gray-300">Confirmar Contraseña</label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#60caba] pr-10"
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.789 9.789 0 011.026-2.317m2.261-2.261C7.818 7.377 9.814 7 12 7c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-1.293 2.923m-4.42-4.42L11 11" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-medium text-black bg-gradient-to-r from-[#60caba] to-[#FFD700] hover:from-[#58b7a9] hover:to-[#E6C600] disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;