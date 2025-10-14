// src/pages/ContactPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { brandConfig } from '../utils/brandConfig';
import { useNotification } from '../contexts/NotificationContext';

const ContactPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { notify } = useNotification();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const userName = isAuthenticated ? user?.name : 'Invitado';
  const userEmail = isAuthenticated ? user?.email : 'inicia-sesion@para.enviar';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      notify('Debes iniciar sesión para enviar un mensaje.', 'error');
      return;
    }
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/contact`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      notify('¡Mensaje enviado exitosamente! Te responderemos pronto.', 'success');
      setFormData({ subject: '', message: '' });
    } catch (err) {
      notify('Hubo un error al enviar el mensaje. Inténtalo de nuevo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] text-gray-100">
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

            {/* SECCIÓN SÍGUENOS MEJORADA */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                <span className="text-3xl">🌐</span>
                <span>Síguenos en Redes</span>
              </h3>
              
              <div className="flex flex-col gap-4">
                
                {/* Botón de Facebook Mejorado */}
                <a 
                  href={brandConfig.social.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group relative flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-[#1877F2]/10 to-transparent border border-[#1877F2]/20 hover:border-[#1877F2]/50 hover:from-[#1877F2]/20 transition-all duration-300 overflow-hidden"
                >
                  <div className="flex items-center space-x-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-[#1877F2]/20 flex items-center justify-center group-hover:bg-[#1877F2]/30 transition-all duration-300">
                      <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-white text-lg block">Facebook</span>
                      <span className="text-sm text-gray-400">@Andres Borrero</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#1877F2] group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1877F2]/0 via-[#1877F2]/5 to-[#1877F2]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
                
                {/* Botón de Instagram Mejorado */}
                <a 
                  href={brandConfig.social.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group relative flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-[#E4405F]/10 to-transparent border border-[#E4405F]/20 hover:border-[#E4405F]/50 hover:from-[#E4405F]/20 transition-all duration-300 overflow-hidden"
                >
                  <div className="flex items-center space-x-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#833AB4]/20 via-[#E4405F]/20 to-[#FCAF45]/20 flex items-center justify-center group-hover:from-[#833AB4]/30 group-hover:via-[#E4405F]/30 group-hover:to-[#FCAF45]/30 transition-all duration-300">
                      <svg className="w-6 h-6 text-[#E4405F]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-white text-lg block">Instagram</span>
                      <span className="text-sm text-gray-400">@andresborreroc</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#E4405F] group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#E4405F]/0 via-[#E4405F]/5 to-[#E4405F]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>

                {/* Botón de TikTok Mejorado */}
                <a 
                  href={brandConfig.social.tiktok} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group relative flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-white/10 to-transparent border border-white/20 hover:border-white/40 hover:from-white/20 transition-all duration-300 overflow-hidden"
                >
                  <div className="flex items-center space-x-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-white text-lg block">TikTok</span>
                      <span className="text-sm text-gray-400">@_andresborrero_</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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