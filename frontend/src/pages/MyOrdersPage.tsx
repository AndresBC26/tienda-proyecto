// src/pages/MyOrdersPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Loading from '../components/common/Loading';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext'; // Importar hook de notificación

interface Order {
  _id: string;
  products: { product: { _id: string; name: string; image?: string; variants?: { images: string[] }[] }; quantity: number; selectedSize: string }[];
  total: number;
  status: 'pending' | 'approved' | 'rejected' | 'in_process';
  createdAt: string;
}

const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { notify } = useNotification(); // Inicializar hook de notificación

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
      } catch (error) {
        console.error("Error al cargar las órdenes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // ✅ NUEVA FUNCIÓN: Maneja la cancelación del pedido
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar este pedido? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      await axios.delete(`${apiUrl}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Actualiza la lista de pedidos en la pantalla sin recargar la página
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      notify('Pedido cancelado exitosamente.', 'success');
    } catch (error: any) {
      console.error("Error al cancelar el pedido:", error);
      notify(error.response?.data?.message || 'Error al cancelar el pedido.', 'error');
    }
  };

  const getStatusChip = (status: Order['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-300';
      case 'in_process': return 'bg-blue-500/20 text-blue-300';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      case 'rejected': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const statusText = {
    approved: 'Aprobado', in_process: 'En Proceso', pending: 'Pendiente', rejected: 'Rechazado'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b] py-20 text-white">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
            📦 Mis Pedidos
          </h1>
          <p className="text-gray-400">Aquí puedes ver el historial de todas tus compras.</p>
        </div>
        
        {loading ? ( <div className="flex justify-center"><Loading message="Cargando tus pedidos..." /></div> )
        : orders.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Aún no tienes pedidos</h2>
            <p className="text-gray-400 mb-8">No has realizado ninguna compra todavía.</p>
            <Link to="/products" className="inline-block bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black font-bold py-3 px-6 rounded-xl">
              🛍️ Ver Productos
            </Link>
          </div>
        ) : (
          <div className="space-y-8 max-w-4xl mx-auto">
            {orders.map(order => (
              <div key={order._id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Pedido ID</p>
                    <p className="font-mono text-sm text-gray-300">{order._id}</p>
                  </div>
                  <div className="text-left sm:text-right mt-2 sm:mt-0">
                    <p className="text-xs text-gray-400">Fecha</p>
                    <p className="font-semibold text-gray-200">{new Date(order.createdAt).toLocaleDateString('es-CO')}</p>
                  </div>
                </div>
                {/* ✅ SECCIÓN MODIFICADA PARA AÑADIR EL BOTÓN */}
                <div className="flex justify-between items-center mb-4">
                   <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusChip(order.status)}`}>
                     {statusText[order.status]}
                   </span>
                   {order.status === 'pending' && (
                     <button
                       onClick={() => handleCancelOrder(order._id)}
                       className="bg-red-500/20 text-red-300 text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-500/40 transition-colors"
                     >
                       Cancelar Pedido
                     </button>
                   )}
                  <p className="text-xl font-bold text-white">${order.total.toLocaleString('es-CO')}</p>
                </div>
                <div className="flex space-x-3 overflow-x-auto py-2">
                  {order.products.map((p, index) => {
                    const imageUrl = p.product.image || p.product.variants?.[0]?.images?.[0] || 'https://via.placeholder.com/150?text=No+Image';
                    return (
                      <Link to={`/product/${p.product._id}`} key={`${p.product._id}-${index}`} className="flex-shrink-0">
                        <img src={imageUrl} alt={p.product.name} className="w-20 h-20 object-cover rounded-lg border border-white/10" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;