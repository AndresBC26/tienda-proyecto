// src/pages/PrivacyPolicyPage.tsx
import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] text-gray-100">
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
                Política de Privacidad
              </span>
            </h1>
            <p className="text-lg text-gray-400">Última actualización: 08 de Septiembre de 2025</p>
          </div>

          <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-8 text-gray-300 prose prose-invert prose-lg">
            <p>
              Elegancia Urban ("nosotros", "nuestro" o "nos") opera el sitio web [la-url-de-tu-tienda.com] (el "Servicio"). Esta página te informa de nuestras políticas en cuanto a la recopilación, uso y divulgación de datos personales cuando utilizas nuestro Servicio y las opciones que tienes asociadas con esos datos.
            </p>

            <h2 className="text-white">1. Información que Recopilamos</h2>
            <p>
              Recopilamos varios tipos de información para diversas finalidades para proporcionar y mejorar nuestro Servicio para ti. Esto incluye:
            </p>
            <ul>
                <li><strong>Datos Personales:</strong> Nombre, dirección de correo electrónico, número de teléfono, dirección de envío.</li>
                <li><strong>Datos de Uso:</strong> Información sobre cómo se accede y utiliza el Servicio (por ejemplo, páginas visitadas, tiempo de permanencia).</li>
                <li><strong>Datos de Transacciones:</strong> Detalles sobre los productos que compras y los métodos de pago.</li>
            </ul>

            <h2 className="text-white">2. Cómo Usamos tu Información</h2>
            <p>
              Utilizamos los datos recopilados para diversas finalidades:
            </p>
            <ul>
                <li>Para procesar y gestionar tus pedidos, pagos y envíos.</li>
                <li>Para proporcionar servicio al cliente y responder a tus solicitudes.</li>
                <li>Para comunicarnos contigo sobre promociones, nuevos productos y noticias, solo si has optado por recibir dichas comunicaciones.</li>
                <li>Para mejorar y personalizar nuestro sitio web y tu experiencia de compra.</li>
            </ul>

            <h2 className="text-white">3. Seguridad de los Datos</h2>
            <p>
              La seguridad de tus datos es importante para nosotros. Utilizamos medidas de seguridad estándar de la industria para proteger tu información personal, incluyendo encriptación SSL para las transacciones. Sin embargo, recuerda que ningún método de transmisión por Internet o método de almacenamiento electrónico es 100% seguro.
            </p>

            <h2 className="text-white">4. No Compartimos tus Datos</h2>
            <p>
              Tu privacidad es nuestra prioridad. No vendemos, alquilamos ni compartimos tu información personal con terceros para fines de marketing. Solo compartimos información con proveedores de servicios esenciales, como empresas de logística para la entrega de pedidos y procesadores de pago para completar las transacciones.
            </p>
            
            <h2 className="text-white">5. Tus Derechos</h2>
            <p>
                Tienes derecho a acceder, corregir o eliminar tu información personal que tenemos. Si deseas ejercer estos derechos, por favor contáctanos a través de nuestro correo electrónico de soporte.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;