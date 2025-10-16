// src/pages/CheckoutPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Layout from '../components/layout/Layout';
import { brandConfig } from '../utils/brandConfig';

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  postalCode: string;
  country: string;
}

// ✅ INICIO DE LA MODIFICACIÓN: Lista completa de departamentos
const colombianDepartments = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá", "Caldas", "Caquetá",
  "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía", "Guaviare",
  "Huila", "La Guajira", "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo",
  "Quindío", "Risaralda", "San Andrés y Providencia", "Santander", "Sucre", "Tolima",
  "Valle del Cauca", "Vaupés", "Vichada"
];
// ✅ FIN DE LA MODIFICACIÓN

const CheckoutPage: React.FC = () => {
  const { state: cartState } = useCart();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    department: '',
    postalCode: '',
    country: 'Colombia'
  });

  useEffect(() => {
    if (cartState.items.length === 0) {
      navigate('/cart');
    }
  }, [cartState.items.length, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'department'];
    
    for (const field of requiredFields) {
      if (!shippingAddress[field as keyof ShippingAddress]) {
        setError(`Por favor, completa el campo: ${getFieldLabel(field)}`);
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingAddress.email)) {
      setError('Por favor, ingresa un email válido');
      return false;
    }

    if (shippingAddress.phone.length < 10) {
      setError('Por favor, ingresa un número de teléfono válido');
      return false;
    }

    return true;
  };

  const getFieldLabel = (field: string): string => {
    const labels: { [key: string]: string } = {
      fullName: 'Nombre completo',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      address: 'Dirección',
      city: 'Ciudad',
      department: 'Departamento'
    };
    return labels[field] || field;
  };

  const handleProcessPayment = async () => {
  setError('');

  if (!validateForm()) {
    return;
  }

  setIsLoading(true);

  try {
    const paymentData = {
      cartItems: cartState.items,
      userId: localStorage.getItem('userId') || 'guest',
      shippingAddress: shippingAddress,
    };
    
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const fullUrl = `${backendUrl}/api/payment/create-preference`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); 

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      const textResponse = await response.text();
      throw new Error('Respuesta del servidor no es JSON válido');
    }

    if (!response.ok) {
      throw new Error(data.message || `Error HTTP ${response.status}: ${data.details || 'Error al procesar el pago'}`);
    }

    if (data.id) {
      window.location.href = `https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=${data.id}`;
    } else {
      throw new Error('No se recibió el ID de la preferencia en la respuesta');
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      setError('La petición tardó demasiado. Verifica tu conexión e intenta nuevamente.');
    } else if (error instanceof Error && error.message.includes('fetch')) {
      setError('No se puede conectar con el servidor. Verifica que el backend esté corriendo.');
    } else {
      setError(error instanceof Error ? error.message : 'Error al procesar el pago');
    }
  } finally {
    setIsLoading(false);
  }
};

  if (cartState.items.length === 0) {
    return null; 
  }

  const subtotal = cartState.total;
  const discount = subtotal * (brandConfig.business.discountPercentage || 0.10);
  
  const shippingCost = subtotal >= brandConfig.business.freeShippingThreshold
    ? 0
    : brandConfig.business.shippingCost;

  const total = subtotal - discount + shippingCost;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] py-12">
        <div className="container mx-auto px-6 max-w-7xl">
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Link to="/" className="hover:text-[#FFD700] transition-colors">Inicio</Link>
              <span>›</span>
              <Link to="/cart" className="hover:text-[#FFD700] transition-colors">Carrito</Link>
              <span>›</span>
              <span className="text-gray-200 font-medium">Checkout</span>
            </div>
          </nav>

          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
              💳 Finalizar Compra
            </h1>
            <p className="text-gray-400">
              Completa tus datos de envío para proceder con el pago
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-[#151515]/80 backdrop-blur-sm border border-white/10 rounded-3xl shadow-2xl shadow-black/30 p-8">
                <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center space-x-2">
                  <span>📦</span>
                  <span>Datos de Envío</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba] focus:border-transparent transition-all duration-200"
                      placeholder="Ej: Juan Pérez García"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={shippingAddress.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba] focus:border-transparent transition-all duration-200"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba] focus:border-transparent transition-all duration-200"
                      placeholder="Ej: 3001234567"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Dirección Completa *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba] focus:border-transparent transition-all duration-200"
                      placeholder="Ej: Calle 123 #45-67, Apto 123"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba] focus:border-transparent transition-all duration-200"
                      placeholder="Ej: Bogotá"
                      required
                    />
                  </div>
                  <div>
                    {/* ✅ INICIO DE LA MODIFICACIÓN: Select dinámico */}
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Departamento *
                    </label>
                    <select
                      name="department"
                      value={shippingAddress.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black/10 border border-white/20 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#60caba] focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">Selecciona tu departamento</option>
                      {colombianDepartments.map(dep => (
                        <option key={dep} value={dep}>{dep}</option>
                      ))}
                    </select>
                    {/* ✅ FIN DE LA MODIFICACIÓN */}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba] focus:border-transparent transition-all duration-200"
                      placeholder="Ej: 110111"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      País
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60caba] focus:border-transparent transition-all duration-200"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#151515]/80 backdrop-blur-sm border border-white/10 rounded-3xl shadow-2xl shadow-black/30 p-8 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center space-x-2">
                  <span>📋</span>
                  <span>Resumen del Pedido</span>
                </h2>

                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                  {cartState.items.map(item => (
                    <div key={item.cartItemId} className="flex items-center space-x-3 bg-white/5 rounded-xl p-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">Talla: {item.selectedSize} × {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-100">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-8 pt-6 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Subtotal ({cartState.itemCount} productos)</span>
                    <span className="font-semibold text-gray-100">${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Envío</span>
                    {shippingCost === 0 ? (
                      <span className="font-semibold text-[#60caba]">GRATIS</span>
                    ) : (
                      <span className="font-semibold text-gray-100">${shippingCost.toLocaleString()}</span>
                    )}                          
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Descuento (10%)</span>
                    <span className="font-semibold text-[#60caba]">-${discount.toLocaleString()}</span>
                  </div>
                  <hr className="border-white/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-100">Total</span>
                    <span className="text-2xl font-bold text-[#FFD700]">${total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleProcessPayment}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#60caba] to-[#FFD700] hover:from-[#58b7a9] hover:to-[#E6C600] disabled:from-gray-500 disabled:to-gray-600 text-black font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl shadow-black/20 transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <span>💳</span>
                        <span>Pagar con Mercado Pago</span>
                      </>
                    )}
                  </button>
                  
                  <Link
                    to="/cart"
                    className="block w-full text-center bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 font-semibold py-4 px-6 rounded-2xl transition-all duration-200"
                  >
                    ← Volver al Carrito
                  </Link>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="space-y-3">
                    {[
                      { icon: '🔒', text: 'Pago 100% seguro' },
                      { icon: '🛡️', text: 'Protección de datos' },
                      { icon: '✅', text: 'Compra garantizada' },
                    ].map(({ icon, text }) => (
                      <div key={text} className="flex items-center space-x-3">
                        <span className="text-lg">{icon}</span>
                        <span className="text-sm text-gray-400">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;