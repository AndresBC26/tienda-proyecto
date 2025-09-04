// src/pages/ContactPage.tsx
import React, { useState } from 'react';
import { brandConfig } from '../utils/brandConfig';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [messageSent, setMessageSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📧 Datos del formulario:', formData);
    setMessageSent(true);

    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setMessageSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#172026]">
      {/* HERO */}
      <section className="bg-gradient-to-br from-[#172026] via-[#027373] to-[#04BFAD] py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-[#5FCDD9]/20 text-[#5FCDD9] rounded-full px-4 py-2 mb-6">
              <span className="text-lg">📞</span>
              <span className="font-medium">Contáctanos</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              ¿Necesitas <span className="text-[#5FCDD9]">ayuda?</span>
            </h1>
            <p className="text-xl text-gray-200 leading-relaxed">
              Estamos aquí para resolver todas tus dudas sobre {brandConfig.name}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* FORMULARIO */}
          <div className="bg-[#1c2a30] rounded-3xl shadow-2xl p-8 border border-[#04BFAD]/30">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">✉️ Envíanos un Mensaje</h2>
              <p className="text-gray-300">
                Completa el formulario y te responderemos en menos de 24 horas
              </p>
            </div>

            {messageSent && (
              <div className="bg-gradient-to-r from-[#04BFAD]/20 to-[#5FCDD9]/20 border border-[#5FCDD9]/50 text-[#5FCDD9] px-6 py-4 rounded-2xl mb-6 flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#04BFAD] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">¡Mensaje enviado exitosamente!</p>
                  <p className="text-sm text-[#5FCDD9]">Te responderemos pronto</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {['name', 'email', 'subject'].map((field, i) => (
                <div key={i}>
                  <label
                    htmlFor={field}
                    className="block text-gray-200 font-semibold mb-3 capitalize"
                  >
                    {field === 'name'
                      ? 'Nombre Completo *'
                      : field === 'email'
                        ? 'Correo Electrónico *'
                        : 'Asunto *'}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    id={field}
                    name={field}
                    value={(formData as any)[field]}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border border-[#5FCDD9]/40 rounded-2xl bg-[#172026] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#5FCDD9] focus:border-transparent transition-all duration-200"
                    placeholder={
                      field === 'name'
                        ? 'Tu nombre completo'
                        : field === 'email'
                          ? 'tu@email.com'
                          : '¿De qué se trata tu mensaje?'
                    }
                    required
                  />
                </div>
              ))}

              <div>
                <label htmlFor="message" className="block text-gray-200 font-semibold mb-3">
                  Mensaje *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-4 border border-[#5FCDD9]/40 rounded-2xl bg-[#172026] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#5FCDD9] transition-all duration-200 resize-none"
                  placeholder="Cuéntanos en detalle cómo podemos ayudarte..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#027373] to-[#04BFAD] hover:from-[#04BFAD] hover:to-[#5FCDD9] text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
              >
                <span>📨 Enviar Mensaje</span>
              </button>
            </form>
          </div>

          {/* INFO DE CONTACTO */}
          <div className="space-y-8">
            <div className="bg-[#1c2a30] rounded-3xl shadow-2xl p-8 border border-[#04BFAD]/30">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                <span className="text-3xl">📍</span>
                <span>Información de Contacto</span>
              </h3>
              <div className="space-y-6 text-gray-300">
                <p>
                  <strong>Dirección:</strong>
                  <br />
                  {brandConfig.contact.address.street}
                  <br />
                  {brandConfig.contact.address.city}, {brandConfig.contact.address.country}
                  <br />
                  {brandConfig.contact.address.zipCode}
                </p>
                <p>
                  <strong>Teléfono:</strong> +57 (320) 397-3733
                </p>
                <p>
                  <strong>Email:</strong> estebanleal547@gmail.com
                </p>
                <p>
                  <strong>Horario:</strong> Lun - Vie: 9AM - 6PM
                </p>
              </div>
            </div>

            <div className="bg-[#1c2a30] rounded-3xl shadow-2xl p-8 border border-[#04BFAD]/30">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                <span className="text-3xl">🌐</span>
                <span>Síguenos</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Facebook', icon: '📘', color: 'bg-[#027373]' },
                  { name: 'Twitter', icon: '🐦', color: 'bg-[#04BFAD]' },
                  { name: 'Instagram', icon: '📷', color: 'bg-[#04BF9D]' },
                  { name: 'LinkedIn', icon: '💼', color: 'bg-[#5FCDD9]' },
                ].map(({ name, icon, color }) => (
                  <a
                    key={name}
                    href="#"
                    className={`${color} text-white p-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2 font-semibold`}
                  >
                    <span className="text-xl">{icon}</span>
                    <span>{name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
