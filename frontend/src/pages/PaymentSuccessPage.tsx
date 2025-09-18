// src/pages/PaymentSuccessPage.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useCart } from '../contexts/CartContext';

const PaymentSuccessPage: React.FC = () => {
  const { dispatch } = useCart();

  // Limpia el carrito cuando el componente se monta
  useEffect(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, [dispatch]);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] py-20 text-white">
        <div className="max-w-md mx-auto text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Ícono de éxito */}
          <div className="w-24 h-24 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
            <span className="text-4xl">✅</span>
          </div>

          <h1 className="text-3xl font-bold text-green-300 mb-4">¡Pago Aprobado!</h1>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Gracias por tu compra. Tu pedido está siendo procesado y pronto recibirás una confirmación por correo electrónico.
          </p>
          
          <div className="space-y-4">
            <Link
              to="/profile" // Idealmente a una sección de "Mis Pedidos"
              className="block w-full bg-gradient-to-r from-[#60caba] to-[#FFD700] hover:from-[#58b7a9] hover:to-[#E6C600] text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Ver Mis Pedidos
            </Link>
            <Link
              to="/products"
              className="block w-full bg-white/10 border border-white/20 hover:bg-white/20 text-gray-200 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Seguir Comprando
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccessPage;