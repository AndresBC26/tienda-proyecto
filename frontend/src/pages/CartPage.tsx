// src/pages/CartPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { brandConfig } from '../utils/brandConfig';

const CartPage: React.FC = () => {
  const { state: cartState, dispatch } = useCart();

  const updateQuantity = (cartItemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId, quantity } });
  };

  const removeItem = (cartItemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { cartItemId } });
  };

  const clearCart = () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      dispatch({ type: 'CLEAR_CART' });
    }
  };
  
  const subtotal = cartState.total;
  const discount = subtotal * (brandConfig.business.discountPercentage || 0.10);
  const shippingCost = subtotal >= brandConfig.business.freeShippingThreshold
    ? 0
    : brandConfig.business.shippingCost;
  const finalTotal = subtotal - discount + shippingCost;

  if (cartState.items.length === 0) {
    return (
        // ✅ CORRECCIÓN: Se eliminó la clase `min-h-[calc(...)]` de aquí
        <div className="bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] py-20 text-white">
          <div className="container mx-auto px-6">
            <div className="max-w-md mx-auto text-center">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto bg-[#151515]/80 backdrop-blur-sm border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl shadow-black/30">
                  <div className="text-6xl">🛒</div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#60caba] to-[#FFD700] rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-lg">💨</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-100 mb-4">Tu carrito está vacío</h1>
              <p className="text-gray-400 mb-8 leading-relaxed">
                ¡No te preocupes! Tenemos productos increíbles esperándote. Explora nuestra colección
                y encuentra algo que te encante.
              </p>
              <div className="space-y-4">
                <Link
                  to="/products"
                  className="block w-full bg-gradient-to-r from-[#60caba] to-[#FFD700] hover:from-[#58b7a9] hover:to-[#E6C600] text-black font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl shadow-black/20 transform hover:scale-105"
                >
                  🛍️ Explorar Productos
                </Link>
                <Link
                  to="/"
                  className="block w-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 font-semibold py-4 px-6 rounded-2xl transition-all duration-200"
                >
                  🏠 Volver al Inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
  }

  return (
    // ✅ CORRECCIÓN: Se eliminó la clase `min-h-[calc(...)]` de aquí
    <div className="bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] py-12">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <nav className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Link to="/" className="hover:text-[#FFD700] transition-colors">
                Inicio
              </Link>
              <span>›</span>
              <span className="text-gray-200 font-medium">Carrito de Compras</span>
            </div>
          </nav>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
                🛒 Tu Carrito
              </h1>
              <p className="text-gray-400">
                {cartState.itemCount} {cartState.itemCount === 1 ? 'producto' : 'productos'} en tu
                carrito
              </p>
            </div>
            <button
              onClick={clearCart}
              className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 font-medium py-3 px-4 rounded-xl transition-all duration-200 border border-red-500/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span>Vaciar Carrito</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            {cartState.items.map(item => {
                const itemDiscountPercentage = (brandConfig.business.discountPercentage || 0.10) * 100;
                const itemOriginalPrice = item.price / (1 - (brandConfig.business.discountPercentage || 0.10));

                return (
                  <Link
                    to={`/product/${item._id}`}
                    key={item.cartItemId}
                    className="group bg-[#151515]/80 backdrop-blur-sm border border-white/10 rounded-3xl shadow-2xl shadow-black/30 transition-all duration-300 p-6 block"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-black/20 rounded-2xl overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-100 mb-2 group-hover:text-[#FFD700] transition-colors line-clamp-1">
                              {item.name}
                            </h3>
                            <div className="flex flex-wrap gap-3 mb-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#60caba]/10 text-[#60caba]">
                                {item.category}
                              </span>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300">
                                Talla: <strong>{item.selectedSize}</strong>
                              </span>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-300">
                                ✓ Disponible
                              </span>
                            </div>
                            <div className="flex items-baseline space-x-2 mb-4">
                              <span className="text-2xl font-bold text-gray-100">
                                ${item.price.toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ${itemOriginalPrice.toLocaleString('es-CO', {maximumFractionDigits: 0})}
                              </span>
                              <span className="text-sm font-medium text-red-400">-{itemDiscountPercentage}%</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-4">
                            <div className="flex items-center space-x-3 bg-black/30 rounded-xl p-1">
                              <button
                                onClick={(e) => { e.preventDefault(); updateQuantity(item.cartItemId, item.quantity - 1); }}
                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-bold"
                              >
                                −
                              </button>
                              <span className="w-12 text-center font-bold text-lg text-gray-100">
                                {item.quantity}
                              </span>
                              <button
                                onClick={(e) => { e.preventDefault(); updateQuantity(item.cartItemId, item.quantity + 1); }}
                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-bold"
                              >
                                +
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">Subtotal</p>
                              <p className="text-xl font-bold text-gray-100">
                                ${(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={(e) => { e.preventDefault(); removeItem(item.cartItemId); }}
                              className="flex items-center space-x-2 text-red-300 hover:text-red-200 font-medium transition-colors duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="text-sm">Eliminar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
            })}
          </div>

          <div className="xl:col-span-1">
            <div className="bg-[#151515]/80 backdrop-blur-sm border border-white/10 rounded-3xl shadow-2xl shadow-black/30 p-8 sticky top-24">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-100 mb-2">📋 Resumen del Pedido</h2>
                <p className="text-gray-400">Revisa tu orden antes de proceder</p>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Productos ({cartState.itemCount})</span>
                  <span className="font-semibold text-gray-100">${cartState.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Envío</span>
                  {shippingCost === 0 ? (
                    <div className="text-right">
                      <span className="font-semibold text-[#60caba]">GRATIS</span>
                      <p className="text-xs text-gray-500">En compras +$100.000</p>
                    </div>
                  ) : (
                    <span className="font-semibold text-gray-100">${shippingCost.toLocaleString()}</span>
                  )}
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Descuentos (10%)</span>
                  <span className="font-semibold text-[#60caba]">-${discount.toLocaleString()}</span>
                </div>
                <hr className="border-white/10" />
                <div className="flex justify-between items-center py-2">
                  <span className="text-xl font-bold text-gray-100">Total</span>
                  <span className="text-2xl font-bold text-[#FFD700]">${finalTotal.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-4">
                <Link
                  to="/checkout"
                  className="block text-center w-full bg-gradient-to-r from-[#60caba] to-[#FFD700] hover:from-[#58b7a9] hover:to-[#E6C600] text-black font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl shadow-black/20 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>💳 Proceder al Pago</span>
                </Link>
                <Link
                  to="/products"
                  className="block w-full text-center bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 font-semibold py-4 px-6 rounded-2xl transition-all duration-200"
                >
                  🛍️ Seguir Comprando
                </Link>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="space-y-3">
                  {[
                    { icon: '🔒', text: 'Pago 100% seguro' },
                    { icon: '🚚', text: 'Envío gratis en 24-48h' },
                    { icon: '↩️', text: 'Devoluciones fáciles' },
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
  );
};

export default CartPage;