import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout'; // CAMBIO: Importamos Layout para consistencia

const RegisterPage: React.FC = () => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
      const response = await axios.post('http://localhost:5000/api/users/register', formData);
      setMessage('✅ ' + response.data.message);
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
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
      {/* CAMBIO: Fondo con degradado oscuro y contenedor principal */}
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] pt-20">
        {/* CAMBIO: Tarjeta del formulario con efecto glassmorphism */}
        <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 p-8 rounded-2xl shadow-lg border border-white/10 w-full max-w-md backdrop-blur-sm">
          {/* CAMBIO: Título con efecto de texto degradado */}
          <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
            Crear una Cuenta
          </h2>

          {/* CAMBIO: Mensajes de alerta con estilo translúcido */}
          {message && (
            <div className={`p-3 mb-4 rounded-lg border text-center ${
                message.includes('✅') 
                ? 'bg-green-500/20 text-green-200 border-green-500/30' 
                : 'bg-red-500/20 text-red-200 border-red-500/30'
            }`}>
              {message}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* CAMBIO: Inputs con el nuevo estilo */}
            <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                placeholder="Nombre completo" 
                className="block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba] focus:border-transparent" 
            />
            <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                placeholder="Correo electrónico" 
                className="block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba] focus:border-transparent" 
            />
            
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                placeholder="Contraseña" 
                className="block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba] focus:border-transparent pr-12"
              />
              <button
                type="button"
                onClick={handleTogglePassword}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors duration-200"
              >
                {/* Íconos sin cambios, ya se ven bien */}
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.789 9.789 0 011.026-2.317m2.261-2.261C7.818 7.377 9.814 7 12 7c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-1.293 2.923m-4.42-4.42L11 11" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
            
            {/* CAMBIO: Estilo de Checkboxes y enlaces */}
            <div className="flex items-start">
              <input
                id="acceptedTerms"
                name="acceptedTerms"
                type="checkbox"
                checked={formData.acceptedTerms}
                onChange={handleChange}
                required
                className="mt-1 h-4 w-4 text-[#60caba] bg-white/10 border-white/20 rounded focus:ring-[#FFD700]"
              />
              <label htmlFor="acceptedTerms" className="ml-3 block text-sm text-gray-300">
                Acepto los <a href="#" className="font-medium text-[#60caba] hover:text-[#FFD700] underline">términos y condiciones</a> y la <a href="#" className="font-medium text-[#60caba] hover:text-[#FFD700] underline">Política de Protección de Datos</a>.
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="wantsEmails"
                name="wantsEmails"
                type="checkbox"
                checked={formData.wantsEmails}
                onChange={handleChange}
                className="h-4 w-4 text-[#60caba] bg-white/10 border-white/20 rounded focus:ring-[#FFD700]"
              />
              <label htmlFor="wantsEmails" className="ml-3 block text-sm text-gray-300">
                Quiero recibir ofertas y promociones.
              </label>
            </div>
            
            {/* CAMBIO: Botón principal con el nuevo degradado y estado disabled */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-medium text-black bg-gradient-to-r from-[#60caba] to-[#FFD700] hover:from-[#58b7a9] hover:to-[#E6C600] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#60caba] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            ¿Ya tienes una cuenta?{' '}
            {/* CAMBIO: Enlace con el nuevo estilo */}
            <Link to="/login" className="font-medium text-[#60caba] hover:text-[#FFD700] transition-colors duration-300">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;