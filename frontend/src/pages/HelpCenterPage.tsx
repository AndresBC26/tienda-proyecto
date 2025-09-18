// src/pages/HelpCenterPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const HelpCenterPage: React.FC = () => {
  const faqs = [
    {
      category: 'Pedidos y Envíos',
      questions: [
        {
          q: '¿Cómo puedo rastrear mi pedido?',
          a: 'Una vez que tu pedido sea enviado, recibirás un correo electrónico con un número de seguimiento y un enlace para que puedas ver el estado de tu envío en tiempo real.'
        },
        {
          q: '¿Cuánto tiempo tarda en llegar mi pedido?',
          a: 'Los pedidos estándar suelen tardar entre 3 y 5 días hábiles. Ofrecemos envío express que tarda entre 24 y 48 horas. Los tiempos pueden variar según tu ubicación.'
        },
        {
          q: '¿Realizan envíos a todo el país?',
          a: 'Sí, realizamos envíos a todas las ciudades de Colombia. ¡Llevamos el estilo urbano a cada rincón!'
        },
      ]
    },
    {
      category: 'Productos y Tallas',
      questions: [
        {
          q: '¿De qué material están hechas las camisetas?',
          a: 'Nuestras camisetas premium están hechas de 100% algodón peinado de alta calidad, lo que garantiza suavidad, durabilidad y un ajuste perfecto.'
        },
        {
          q: '¿Cómo elijo la talla correcta?',
          a: 'Te recomendamos revisar nuestra guía de tallas. Mide una camiseta que te quede bien y compara las medidas con nuestra tabla para asegurar el mejor ajuste.'
        },
      ]
    },
    {
      category: 'Devoluciones y Pagos',
      questions: [
        {
          q: '¿Cuál es su política de devoluciones?',
          a: 'Tienes hasta 30 días para devolver un producto si no estás satisfecho. El producto debe estar en su estado original, sin usar y con sus etiquetas. Consulta nuestros Términos de Servicio para más detalles.'
        },
        {
          q: '¿Qué métodos de pago aceptan?',
          a: 'Aceptamos tarjetas de crédito/débito (Visa, MasterCard), PSE, Nequi, y Daviplata. Todas las transacciones son 100% seguras.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] text-gray-100">
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
                Centro de Ayuda
              </span>
            </h1>
            <p className="text-xl text-gray-300">
              Encuentra respuestas a tus preguntas más frecuentes.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            {faqs.map((category, index) => (
              <div key={index}>
                <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-[#60caba] pl-4">
                  {category.category}
                </h2>
                <div className="space-y-6">
                  {category.questions.map((faq, qIndex) => (
                    <div key={qIndex} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold text-gray-100 mb-3">{faq.q}</h3>
                      <p className="text-gray-300 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center max-w-2xl mx-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">¿No encuentras lo que buscas?</h3>
            <p className="text-gray-300 mb-6">
              Nuestro equipo de soporte está listo para ayudarte. Contáctanos y te responderemos lo antes posible.
            </p>
            <Link
              to="/contact"
              className="inline-block bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black font-bold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105"
            >
              Contactar a Soporte
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenterPage;