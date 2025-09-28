// src/pages/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import { useNotification } from '../contexts/NotificationContext';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { notify } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/users/forgot-password`, { email });
      notify(response.data.message, 'success');
      setEmail('');
    } catch (err: any) {
      notify(err.response?.data?.message || 'Ocurrió un error al procesar la solicitud.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] py-20">
        <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 p-8 rounded-2xl shadow-lg border border-white/10 w-full max-w-sm backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
            Recuperar Contraseña
          </h2>
          <p className="text-center text-gray-400 mb-6 text-sm">
            Ingresa tu correo y te enviaremos las instrucciones para recuperarla.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba] focus:border-transparent"
                required
                placeholder="tu@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-medium text-black bg-gradient-to-r from-[#60caba] to-[#FFD700] hover:from-[#58b7a9] hover:to-[#E6C600] disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Enlace'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-400">
            <Link to="/login" className="font-medium text-[#60caba] hover:text-[#FFD700] transition-colors duration-300">
              ← Volver a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;