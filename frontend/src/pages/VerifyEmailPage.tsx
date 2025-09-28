// src/pages/VerifyEmailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import Loading from '../components/common/Loading';

const VerifyEmailPage: React.FC = () => {
  // 1. Obtenemos el 'token' de la URL (ej: /#/verify-email/A1B2C3D4...)
  const { token } = useParams<{ token: string }>();

  // 2. Estados para manejar el proceso: loading, success, o error.
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Estamos verificando tu cuenta...');

  useEffect(() => {
    // 3. Esta función se ejecuta automáticamente en cuanto la página carga.
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('El enlace de verificación no es válido o está incompleto.');
        return;
      }

      try {
        // 4. Se hace la llamada al backend para que verifique el token en la base de datos.
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/users/verify-email/${token}`);
        
        // 5. Si el backend responde con éxito (código 200)...
        setStatus('success');
        // Se muestra el mensaje de éxito que envía el backend.
        setMessage(response.data.message || '¡Tu correo ha sido verificado con éxito!');
      } catch (err: any) {
        // 6. Si el backend responde con un error...
        setStatus('error');
        // Se muestra el mensaje de error que envía el backend.
        setMessage(err.response?.data?.message || 'Ocurrió un error al verificar tu correo. El enlace puede haber expirado.');
      }
    };

    verifyToken();
  }, [token]); // Se ejecuta cada vez que el token de la URL cambie.

  // 7. Esta función decide qué mostrar en la pantalla según el estado.
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return <Loading message={message} size="lg" />;
      
      case 'success':
        // Muestra el mensaje de éxito y un botón claro para ir a iniciar sesión.
        return (
          <>
            <div className="w-24 h-24 mx-auto bg-green-500/20 rounded-3xl flex items-center justify-center mb-6 border border-green-500/30">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">¡Cuenta Verificada!</h1>
            <p className="text-gray-300 mb-8">{message}</p>
            <Link
              to="/login"
              className="bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black font-bold py-3 px-6 rounded-2xl transition-all duration-200 hover:from-[#58b7a9] hover:to-[#E6C600]"
            >
              Iniciar Sesión Ahora
            </Link>
          </>
        );

      case 'error':
        // Muestra un mensaje de error claro y una opción para volver a intentarlo.
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