// src/pages/RegisterPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';

declare global {
  interface Window {
    google: any;
  }
}
interface GoogleCredentialResponse {
  credential?: string;
}

const RegisterPage: React.FC = () => {
  const { loginWithGoogle, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    wantsEmails: true,
    acceptedTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const googleButtonContainerRef = useRef<HTMLDivElement>(null);

  const handleGoogleCallback = async (response: GoogleCredentialResponse) => {
    if (response.credential) {
      setLoading(true);
      setMessage('');
      
      console.log('Google callback iniciado');
      console.log('Credential length:', response.credential?.length);
      
      try {
        // CORRECTION: Pass 'register' as the second argument
        await loginWithGoogle(response.credential, 'register');
        navigate('/');
      } catch (err: any) {
        console.error('Error en handleGoogleCallback:', err);
        setMessage(' ' + (err.message || 'Error al registrarse con Google.'));
        setLoading(false);
      }
    } else {
      console.error('No se recibió credential de Google');
      setMessage('No se pudo obtener la información de Google. Intenta de nuevo.');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }

    if (window.google?.accounts?.id && googleButtonContainerRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: '714367295627-vpeoa81drg97voneiii9drddnnk523ge.apps.googleusercontent.com',
          callback: handleGoogleCallback,
          auto_prompt: false
        });

        window.google.accounts.id.renderButton(
          googleButtonContainerRef.current,
          {
            theme: 'filled_black',
            size: 'large',
            type: 'standard',
            text: 'continue_with',
            shape: 'pill',
            logo_alignment: 'left'
          }
        );
      } catch (error) {
        console.error("Error al inicializar Google Sign-In:", error);
        setMessage("No se pudo cargar el botón de Google. Recarga la página.");
      }
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!formData.acceptedTerms) {
      setMessage('❌ Debes aceptar los términos y condiciones para continuar.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/register`, formData);
      setMessage('✅ ' + response.data.message);

      // Redirige a la nueva página de éxito.
      setTimeout(() => { navigate('/login'); }, 2000);

    } catch (err: any) {
      setMessage('❌ ' + (err.response?.data?.message || 'Error al registrarse'));
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] py-20">
        <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 p-8 rounded-2xl shadow-lg border border-white/10 w-full max-w-md backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
            Crear una Cuenta
          </h2>
          {message && (
            <div className={`p-3 mb-4 rounded-lg border text-center text-sm ${
                message.includes('✅') 
                ? 'bg-green-500/20 text-green-200 border-green-500/30' 
                : 'bg-red-500/20 text-red-200 border-red-500/30'
            }`}>
              {message}
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Nombre completo" className="block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba] focus:border-transparent"/>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Correo electrónico" className="block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba] focus:border-transparent"/>
              <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required placeholder="Contraseña" className="block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba] focus:border-transparent pr-12"/>
                  <button type="button" onClick={handleTogglePassword} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200">
                      {showPassword ? ( <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> ) : ( <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.789 9.789 0 011.026-2.317m2.261-2.261C7.818 7.377 9.814 7 12 7c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-1.293 2.923m-4.42-4.42L11 11" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> )}
                  </button>
              </div>
              <div className="flex items-start pt-2">
                  <input id="acceptedTerms" name="acceptedTerms" type="checkbox" checked={formData.acceptedTerms} onChange={handleChange} required className="mt-1 h-4 w-4 text-[#60caba] bg-white/10 border-white/20 rounded focus:ring-[#FFD700]"/>
                  <label htmlFor="acceptedTerms" className="ml-3 block text-sm text-gray-300">Acepto los <a href="#/terms-of-service" className="font-medium text-[#60caba] hover:text-[#FFD700] underline">términos y condiciones</a> y la <a href="#/privacy-policy" className="font-medium text-[#60caba] hover:text-[#FFD700] underline">Política de Protección de Datos</a>.</label>
              </div>
              <div className="flex items-center">
                  <input id="wantsEmails" name="wantsEmails" type="checkbox" checked={formData.wantsEmails} onChange={handleChange} className="h-4 w-4 text-[#60caba] bg-white/10 border-white/20 rounded focus:ring-[#FFD700]"/>
                  <label htmlFor="wantsEmails" className="ml-3 block text-sm text-gray-300">Quiero recibir ofertas y promociones.</label>
              </div>
              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-medium text-black bg-gradient-to-r from-[#60caba] to-[#FFD700] hover:from-[#58b7a9] hover:to-[#E6C600] disabled:opacity-50">
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>
          </form>
          <div className="my-6 flex items-center"><div className="flex-grow border-t border-white/20"></div><span className="mx-4 text-gray-400 text-sm">O</span><div className="flex-grow border-t border-white/20"></div></div>

          <div className="relative w-full h-[40px]">
            <button
              type="button"
              disabled={loading}
              className="w-full h-full flex justify-center items-center py-3 px-4 border border-white/30 rounded-full shadow-lg text-sm font-medium text-gray-100 bg-black hover:bg-gray-900"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.618-3.417-11.284-8.081l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,30.651,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
              Continuar con Google
            </button>
            <div
              ref={googleButtonContainerRef}
              className="absolute top-0 left-0 w-full h-full opacity-0 overflow-hidden"
            ></div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-400">¿Ya tienes una cuenta? <Link to="/login" className="font-medium text-[#60caba] hover:text-[#FFD700]">Inicia sesión</Link></div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;