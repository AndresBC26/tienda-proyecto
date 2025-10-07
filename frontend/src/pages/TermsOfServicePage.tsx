// src/pages/TermsOfServicePage.tsx
import React from 'react';

const TermsOfServicePage: React.FC = () => {
  return (
    // ✅ CORRECCIÓN: Se ha eliminado `min-h-screen` de esta línea.
    <div className="bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] text-gray-100">
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
                Términos de Servicio
              </span>
            </h1>
            <p className="text-lg text-gray-400">Última actualización: 08 de Septiembre de 2025</p>
          </div>

          <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-8 text-gray-300 prose prose-invert prose-lg">
            <p>
              Bienvenido a Elegancia Urban. Estos términos y condiciones describen las reglas y regulaciones para el uso del sitio web de Elegancia Urban, ubicado en [la-url-de-tu-tienda.com]. Al acceder a este sitio web, asumimos que aceptas estos términos y condiciones. No continúes usando Elegancia Urban si no estás de acuerdo con todos los términos y condiciones establecidos en esta página.
            </p>

            <h2 className="text-white">1. Cuentas de Usuario</h2>
            <p>
              Cuando creas una cuenta con nosotros, debes proporcionarnos información precisa, completa y actual en todo momento. El incumplimiento de esta obligación constituye una violación de los Términos, lo que puede resultar en la terminación inmediata de tu cuenta en nuestro Servicio.
            </p>

            <h2 className="text-white">2. Productos y Precios</h2>
            <p>
              Nos esforzamos por mostrar con la mayor precisión posible los colores y las imágenes de nuestros productos que aparecen en la tienda. No podemos garantizar que la visualización de cualquier color en el monitor de tu computadora sea precisa. Los precios de nuestros productos están sujetos a cambios sin previo aviso.
            </p>
            
            <h2 className="text-white">3. Pedidos y Pagos</h2>
            <p>
              Nos reservamos el derecho de rechazar cualquier pedido que realices con nosotros. Podemos, a nuestra entera discreción, limitar o cancelar las cantidades compradas por persona, por hogar o por pedido.
            </p>

            <h2 className="text-white">4. Política de Devoluciones</h2>
            <p>
              Nuestra política de devoluciones permite la devolución de productos dentro de los 30 días posteriores a la recepción. Los productos deben estar sin usar, en su estado original y con todas las etiquetas intactas. El cliente es responsable de los costos de envío de la devolución, a menos que el producto sea defectuoso o incorrecto.
            </p>

            <h2 className="text-white">5. Propiedad Intelectual</h2>
            <p>
              El Servicio y su contenido original, características y funcionalidad son y seguirán siendo propiedad exclusiva de Elegancia Urban y sus licenciantes. Nuestros diseños de camisetas y marcas comerciales no pueden ser utilizados en conexión con ningún producto o servicio sin el consentimiento previo por escrito de Elegancia Urban.
            </p>

            <h2 className="text-white">6. Ley Aplicable</h2>
            <p>
              Estos Términos se regirán e interpretarán de acuerdo con las leyes de Colombia, sin tener en cuenta sus disposiciones sobre conflicto de leyes.
            </p>
            
            <h2 className="text-white">7. Cambios a los Términos</h2>
            <p>
              Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso de al menos 30 días antes de que los nuevos términos entren en vigencia.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfServicePage;