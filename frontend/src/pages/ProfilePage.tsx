// src/pages/ProfilePage.tsx
import React, { useState, useEffect, useRef } from 'react'; // Se añade useRef
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Loading from '../components/common/Loading';
import { useNotification } from '../contexts/NotificationContext';
import axios from 'axios';

// ====================== MEJORA 1: DECLARACIONES GLOBALES ======================
// Necesarias para que TypeScript entienda la API de Google en el objeto 'window'.
// ============================================================================
declare global {
  interface Window {
    google: any;
  }
}
interface GoogleCredentialResponse {
  credential?: string;
}
// ============================================================================


const ProfilePage: React.FC = () => {
  // ================= MEJORA 2: SE OBTIENE LA NUEVA FUNCIÓN ==================
  const { user, loading, updateUserData, linkWithGoogle } = useAuth();
  // ========================================================================
  const { notify } = useNotification();
  const googleButtonContainerRef = useRef<HTMLDivElement>(null); // Ref para el botón de Google

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =============================================================
  // --- ✨ MEJORA 3: NUEVA FUNCIÓN PARA MANEJAR LA VINCULACIÓN ---
  // =============================================================
  const handleGoogleLinkCallback = async (response: GoogleCredentialResponse) => {
    if (response.credential && user) {
      try {
        // Llama a la función del AuthContext para vincular la cuenta
        await linkWithGoogle(response.credential);
        notify('¡Tu cuenta de Google ha sido vinculada exitosamente!', 'success');
      } catch (err: any) {
        notify(err.message || 'Error al vincular la cuenta de Google.', 'error');
      }
    }
  };
  // =============================================================

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });

      // ========================================================================
      // --- ✨ MEJORA 4: LÓGICA PARA RENDERIZAR EL BOTÓN DE GOOGLE ---
      // ========================================================================
      // Si el usuario no tiene 'googleId' y la API de Google está cargada, muestra el botón.
      if (!user.googleId && window.google?.accounts?.id && googleButtonContainerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: '714367295627-vpeoa81drg97voneiii9drddnnk523ge.apps.googleusercontent.com',
            callback: handleGoogleLinkCallback, // Usa la nueva función de callback
          });

          window.google.accounts.id.renderButton(
            googleButtonContainerRef.current,
            { theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill' }
          );
        } catch (error) {
          console.error("Error al inicializar Google Sign-In para vincular:", error);
          notify("No se pudo cargar la opción de vincular con Google.", "error");
        }
      }
    }
  }, [user]); // El efecto se ejecuta cada vez que el objeto 'user' cambia

  // El resto de tus funciones (handleChange, handleCancel, handleSubmit) no necesitan cambios.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleCancel = () => {
    if (user) setFormData({ name: user.name, email: user.email });
    setIsEditing(false);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.put(`${API_URL}/api/users/${user._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    return <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] flex items-center justify-center"><Loading message="Cargando perfil..." /></div>;
  }
  if (!user) {
    return <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] flex items-center justify-center p-4"><div className="text-center"><p className="text-xl text-gray-300 mb-4">No se pudo cargar la información del usuario.</p><Link to="/login" className="text-lg font-bold text-black bg-gradient-to-r from-[#60caba] to-[#FFD700] px-6 py-3 rounded-xl">Ir a Iniciar Sesión</Link></div></div>;
  }

  return (
    <div className="bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] py-12 text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent mb-2">Mi Cuenta</h1>
          <p className="text-gray-400">Administra tu información personal y preferencias.</p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <aside className="md:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-3">
              <div className="flex items-center space-x-3 px-4 py-3 bg-white/10 rounded-lg text-white font-semibold"><span>👤</span><span>Datos Personales</span></div>
              <Link to="/favorites" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors"><span>❤️</span><span>Mis Favoritos</span></Link>
              {user.role === 'admin' && (<Link to="/admin" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors"><span>👑</span><span>Panel de Admin</span></Link>)}
            </div>
          </aside>

          {/* El 'main' ahora tiene un 'space-y-8' para separar las tarjetas */}
          <main className="md:col-span-2 space-y-8">
            <form onSubmit={handleSubmit}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                {/* Tu formulario de "Datos Personales" se mantiene aquí sin cambios */}
              </div>
            </form>
            
            {/* ================================================================ */}
            {/* --- ✨ MEJORA 5: SECCIÓN DE MÉTODOS DE INICIO DE SESIÓN --- */}
            {/* ================================================================ */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Métodos de Inicio de Sesión</h2>
              
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10 mb-4">
                <div className="flex items-center gap-4"><span className="text-2xl">✉️</span><div><p className="font-semibold text-gray-200">Email y Contraseña</p><p className="text-sm text-gray-400">Método principal de inicio de sesión.</p></div></div>
                <button type="button" className="text-sm font-medium text-[#60caba] hover:text-[#FFD700]">Actualizar</button>
              </div>

              {/* Lógica condicional: muestra estado "Conectado" o el botón para vincular */}
              {user.googleId ? (
                <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 text-green-400" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.618-3.417-11.284-8.081l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,30.651,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                    <div><p className="font-semibold text-green-200">Conectado con Google</p><p className="text-sm text-gray-400">Puedes iniciar sesión con Google.</p></div>
                  </div>
                  <button type="button" className="text-sm font-medium text-red-400 hover:text-red-300">Desvincular</button>
                </div>
              ) : (
                <div className="relative">
                  <p className="text-gray-300 mb-4">Vincula tu cuenta de Google para un inicio de sesión más rápido y seguro.</p>
                  <div ref={googleButtonContainerRef}></div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;