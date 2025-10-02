// src/pages/VerifyEmailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import Loading from '../components/common/Loading';
import { useAuth } from '../contexts/AuthContext'; 

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  // ===================== LÍNEA AÑADIDA PARA DEPURAR =====================
  console.log("Token extraído de la URL por useParams:", token);
  // ====================================================================

  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Estamos verificando tu cuenta...');
  
  const { authenticateUser } = useAuth(); 

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('El enlace de verificación no es válido o está incompleto.');
        return;
      }

      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        
        const response = await axios.get(`${apiUrl}/api/users/verify-email/${token}`);
        
        const { token: jwtToken, user: userData } = response.data;

        if (jwtToken && userData) {
            authenticateUser(jwtToken, userData); 
        }
        
        setStatus('success');
        setMessage('¡Tu cuenta ha sido verificada e iniciada sesión con éxito!');

        timer = setTimeout(() => {
          navigate('/'); 
        }, 3000);

      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Ocurrió un error. Por favor, intenta iniciar sesión.');
        
        timer = setTimeout(() => {
          navigate('/login'); 
        }, 3000);
      }
    };

    verifyToken();
    
    return () => {
        clearTimeout(timer);
    };

  }, [token, navigate, authenticateUser]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return <Loading message={message} size="lg" />;
      
      case 'success':
        return (
          <>
            <div className="w-24 h-24 mx-auto bg-green-500/20 rounded-3xl flex items-center justify-center mb-6 border border-green-500/30">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">¡Cuenta Verificada!</h1>
            <p className="text-gray-300 mb-2">{message}</p>
            <p className="text-gray-400">Serás redirigido al Home en 3 segundos...</p>
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