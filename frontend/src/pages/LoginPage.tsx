// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';

// Declara 'google' en el objeto window para TypeScript
declare global {
  interface Window {
    google: any;
  }
}

interface GoogleCredentialResponse {
  credential?: string;
}

const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // ===== ESTADO AÑADIDO PARA EL 'OJITO' =====
  const [showPassword, setShowPassword] = useState(false);
  // ===========================================

  const handleGoogleCallback = async (response: GoogleCredentialResponse) => {
    if (response.credential) {
        setLoading(true);
        setError(null);
        try {
          const loggedInUser = await loginWithGoogle(response.credential);
          if (loggedInUser.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } catch (err: any) {
          setError(err.message || 'Error al iniciar sesión con Google.');
          setLoading(false);
        }
      }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
        if (window.google) {
            window.google.accounts.id.initialize({
              client_id: '714367295627-vpeoa81drg97voneiii9drddnnk523ge.apps.googleusercontent.com',
              callback: handleGoogleCallback,
            });
        }
    }
  }, [isAuthenticated, user, navigate]);
  
  const handleGoogleSignInClick = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      setError("La biblioteca de Google no se ha cargado correctamente.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loggedInUser = await login(formData);
      if (loggedInUser) {
        if (loggedInUser.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] pt-20">
        <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 p-8 rounded-2xl shadow-lg border border-white/10 w-full max-w-sm backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
            Iniciar Sesión
          </h2>
          {error && (
            <div className="p-3 mb-4 bg-red-500/20 text-red-200 rounded-lg border border-red-500/30">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-300">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba] focus:border-transparent" required placeholder="tu@email.com" />
              </div>

              {/* ===== CAMPO DE CONTRASEÑA MODIFICADO ===== */}
              <div>
                  <label className="block text-sm font-medium text-gray-300">Contraseña</label>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba] focus:border-transparent pr-10"
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
              {/* =========================================== */}
              
              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-medium text-black bg-gradient-to-r from-[#60caba] to-[#FFD700] hover:from-[#58b7a9] hover:to-[#E6C600] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#151515] focus:ring-[#60caba] transition-all duration-300">
                  {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
          </form>
          
          <div className="text-center mt-4">
              <Link to="/forgot-password" className="text-sm font-medium text-[#60caba] hover:text-[#FFD700] transition-colors duration-300">
                  ¿Olvidaste tu contraseña?
              </Link>
          </div>
          
          <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="mx-4 text-gray-400 text-sm">O</span>
            <div className="flex-grow border-t border-white/20"></div>
          </div>
          
          <button
            type="button"
            onClick={handleGoogleSignInClick}
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-white/30 rounded-2xl shadow-lg text-sm font-medium text-gray-100 bg-black/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#151515] focus:ring-white transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-3" aria-hidden="true" focusable="false" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.618-3.417-11.284-8.081l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,30.651,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
            Iniciar Sesion con Google
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="font-medium text-[#60caba] hover:text-[#FFD700] transition-colors duration-300">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;