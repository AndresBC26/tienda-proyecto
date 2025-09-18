// src/pages/VerifyEmailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import Loading from '../components/common/Loading';

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No se proporcionó un token de verificación.');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/users/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.message);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Ocurrió un error al verificar tu correo.');
      }
    };

    verifyToken();
  }, [token]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return <Loading message="Verificando tu cuenta..." size="lg" />;
      case 'success':
        return (
          <>
            <div className="w-24 h-24 mx-auto bg-green-500/20 rounded-3xl flex items-center justify-center mb-6 border border-green-500/30">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">¡Verificación Exitosa!</h1>
            <p className="text-gray-300 mb-8">{message}</p>
            <Link
              to="/login"
              className="bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black font-bold py-3 px-6 rounded-2xl transition-all duration-200 hover:from-[#58b7a9] hover:to-[#E6C600]"
            >
              Iniciar Sesión
            </Link>
          </>
        );
      case 'error':
        return (
          <>
            <div className="w-24 h-24 mx-auto bg-red-500/20 rounded-3xl flex items-center justify-center mb-6 border border-red-500/30">
              <span className="text-4xl">❌</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Error de Verificación</h1>
            <p className="text-gray-300 mb-8">{message}</p>
            <Link
              to="/register"
              className="bg-white/10 border border-white/20 text-white font-semibold py-3 px-6 rounded-2xl"
            >
              Intentar Registrarse de Nuevo
            </Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] pt-20">
        <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 p-8 rounded-2xl shadow-lg border border-white/10 w-full max-w-md backdrop-blur-sm text-center">
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmailPage;