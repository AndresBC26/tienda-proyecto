// src/pages/PaymentFailurePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const PaymentFailurePage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] py-20 text-white">
        <div className="max-w-md mx-auto text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Ícono de error */}
          <div className="w-24 h-24 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/30">
            <span className="text-4xl">❌</span>
          </div>

          <h1 className="text-3xl font-bold text-red-300 mb-4">Pago Rechazado</h1>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Hubo un problema al procesar tu pago. Por favor, verifica los datos de tu tarjeta o intenta con otro método de pago.
          </p>
          
          <div className="space-y-4">
            <Link
              to="/cart" // Lo enviamos de vuelta al carrito para que revise y reintente
              className="block w-full bg-gradient-to-r from-[#60caba] to-[#FFD700] hover:from-[#58b7a9] hover:to-[#E6C600] text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Volver al Carrito e Intentar de Nuevo
            </Link>
            <Link
              to="/contact"
              className="block w-full bg-white/10 border border-white/20 hover:bg-white/20 text-gray-200 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Contactar a Soporte
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentFailurePage;