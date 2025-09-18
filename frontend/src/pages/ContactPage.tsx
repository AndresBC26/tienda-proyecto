// src/pages/ContactPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { brandConfig } from '../utils/brandConfig';
import { useNotification } from '../contexts/NotificationContext'; // <-- IMPORTADO

const ContactPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { notify } = useNotification(); // <-- HOOK EN USO
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  // Pre-rellena los campos si el usuario está logueado
  const userName = isAuthenticated ? user?.name : 'Invitado';
  const userEmail = isAuthenticated ? user?.email : 'inicia-sesion@para.enviar';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      notify('Debes iniciar sesión para enviar un mensaje.', 'error'); // <-- CAMBIADO
      return;
    }
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      // ✅ SOLUCIÓN APLICADA AQUÍ
      await axios.post(`${process.env.REACT_APP_API_URL}/api/contact`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      notify('¡Mensaje enviado exitosamente! Te responderemos pronto.', 'success'); // <-- CAMBIADO
      setFormData({ subject: '', message: '' });
    } catch (err) {
      notify('Hubo un error al enviar el mensaje. Inténtalo de nuevo.', 'error'); // <-- CAMBIADO
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-500px)] bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] text-gray-100">
      {/* HERO */}
      <section className="bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] py-20 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#60caba]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#FFD700]/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#60caba]/30 to-[#FFD700]/30 text-white rounded-full px-4 py-2 mb-6">
              <span className="text-lg">📞</span>
              <span className="font-medium">Contáctanos</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
                ¿Necesitas ayuda?
              </span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Estamos aquí para resolver todas tus dudas sobre Elegancia Urban
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* FORMULARIO */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">✉️ Envíanos un Mensaje</h2>
              <p className="text-gray-300">
                Completa el formulario y te responderemos en menos de 24 horas
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-200 font-semibold mb-3">Tu Nombre</label>
                  <input type="text" value={userName} readOnly className="w-full px-4 py-4 border border-white/20 rounded-2xl bg-black/40 text-gray-400 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-gray-200 font-semibold mb-3">Tu Email</label>
                  <input type="email" value={userEmail} readOnly className="w-full px-4 py-4 border border-white/20 rounded-2xl bg-black/40 text-gray-400 cursor-not-allowed" />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-gray-200 font-semibold mb-3 capitalize">Asunto *</label>
                  <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required
                    className="w-full px-4 py-4 border border-white/20 rounded-2xl bg-black/40 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#60caba]"
                    placeholder="¿De qué se trata tu mensaje?" />
                </div>

                <div>
                  <label htmlFor="message" className="block text-gray-200 font-semibold mb-3">Mensaje *</label>
                  <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={5} required
                    className="w-full px-4 py-4 border border-white/20 rounded-2xl bg-black/40 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#60caba] resize-none"
                    placeholder="Cuéntanos en detalle cómo podemos ayudarte..." />
                </div>

                {isAuthenticated ? (
                  <button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-[#60caba] to-[#FFD700] hover:from-[#58b7a9] hover:to-[#E6C600] text-black font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-50">
                    <span>{loading ? 'Enviando...' : '📨 Enviar Mensaje'}</span>
                  </button>
                ) : (
                  <Link to="/login" className="block text-center w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold py-4 px-6 rounded-2xl">
                    👤 Inicia Sesión para Enviar
                  </Link>
                )}
            </form>
          </div>

          {/* ===== SECCIÓN DE INFORMACIÓN Y REDES SOCIALES (CON ICONOS SVG MEJORADOS) ===== */}
          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                <span className="text-3xl">📍</span>
                <span>Información de Contacto</span>
              </h3>
              <div className="space-y-6 text-gray-300">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#60caba] to-[#FFD700] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🏢</span>
                  </div>
                  <div>
                    <strong className="text-white">Dirección:</strong>
                    <p>{brandConfig.contact.address.street}</p>
                    <p>{brandConfig.contact.address.city}, {brandConfig.contact.address.country}</p>
                    <p>{brandConfig.contact.address.zipCode}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#60caba] to-[#FFD700] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">📱</span>
                  </div>
                  <div>
                    <strong className="text-white">Teléfono:</strong>
                    <p>{brandConfig.contact.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#60caba] to-[#FFD700] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">✉️</span>
                  </div>
                  <div>
                    <strong className="text-white">Email:</strong>
                    <p>{brandConfig.contact.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#60caba] to-[#FFD700] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🕒</span>
                  </div>
                  <div>
                    <strong className="text-white">Horario:</strong>
                    <p>{brandConfig.business.supportHours}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                <span className="text-3xl">🌐</span>
                <span>Síguenos</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <a 
                  href={brandConfig.social.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-[#1877F2] hover:bg-[#166FE5] text-white p-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:brightness-110 flex flex-col items-center justify-center space-y-1 font-semibold"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z" /></svg>
                  <span className="text-sm">Facebook</span>
                </a>
                
                <a 
                  href={brandConfig.social.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90 text-white p-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:brightness-110 flex flex-col items-center justify-center space-y-1 font-semibold"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z" /></svg>
                  <span className="text-sm">Instagram</span>
                </a>

                 <a 
                  href={brandConfig.social.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-[#1DA1F2] hover:bg-[#1A91DA] text-white p-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:brightness-110 flex flex-col items-center justify-center space-y-1 font-semibold"
                 >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.298 1.634 4.212 3.793 4.649-.418.113-.863.173-1.325.173-.305 0-.602-.03-.893-.086.608 1.883 2.372 3.256 4.465 3.293-1.622 1.272-3.666 2.029-5.88 2.029-.383 0-.761-.022-1.132-.066 2.099 1.353 4.604 2.145 7.333 2.145 8.791 0 13.597-7.29 13.597-13.597 0-.207-.005-.412-.013-.617.934-.675 1.748-1.513 2.393-2.48z" /></svg>
                  <span className="text-sm">Twitter</span>
                </a>

                 <a 
                  href="#" 
                  className="bg-[#000000] hover:bg-[#333333] text-white p-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:brightness-110 flex flex-col items-center justify-center space-y-1 font-semibold"
                 >
                  <svg className="w-8 h-8" fill="currentColor" role="img" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91.02.08 0 .14.02.2.04.05.02.1.05.15.07.36.17.7.39 1.02.66.33.28.6.6.82.97.23.38.42.79.56 1.22.14.42.23.86.28 1.3.05.43.08.86.08 1.29v3.95c-.01.33 0 .66-.02.99-.02.43-.05.86-.12 1.28-.08.43-.21.85-.41 1.25-.2.4-.45.77-.75 1.12-.3.35-.65.66-1.04.91-.38.25-.8.45-1.25.59-.44.14-.88.23-1.33.28-.44.05-.89.07-1.34.07s-.9-.02-1.35-.07c-.44-.05-.88-.14-1.32-.28a6.9 6.9 0 0 1-1.25-.59c-.39-.25-.74-.56-1.04-.91-.3-.35-.56-.7-.75-1.12-.2-.4-.33-.82-.41-1.25-.08-.42-.12-.85-.12-1.28v-3.95c.01-.33.01-.66.02-1 .02-.43.05-.86.12-1.28.08-.43.21-.84.41-1.25.2-.4.45-.77.75-1.12.3-.35.65-.66 1.04-.91.38-.25.8-.45 1.25-.59.44-.14.88-.23 1.33-.28.44-.05.89-.07 1.34-.07H12.525zM9.62 6.54v8.94c0 1.21.98 2.19 2.19 2.19s2.19-.98 2.19-2.19V6.54h2.18v8.94c0 2.42-1.97 4.39-4.37 4.39s-4.37-1.97-4.37-4.39V6.54h2.18z"/>
                  </svg>
                  <span className="text-sm">TikTok</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;