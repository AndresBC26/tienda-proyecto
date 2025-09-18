// src/pages/admin/Reviews.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  product: {
    _id: string;
    name: string;
  };
}

const ReviewsAdmin: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  // ✅ SOLUCIÓN CORRECTA PARA CREATE REACT APP
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/reviews`);
      
      if (!res.data) {
        throw new Error('No se recibieron datos del servidor');
      }
      
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error("Error fetching reviews:", err);
      setError(`Error al cargar reseñas: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta reseña?")) {
      try {
        await axios.delete(`${API_URL}/api/reviews/${reviewId}`);
        setReviews(reviews.filter(review => review._id !== reviewId));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error("Error deleting review:", err);
        alert(`Error al eliminar la reseña: ${errorMessage}`);
      }
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-600'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-teal-300';
    if (rating >= 3) return 'text-amber-300';
    return 'text-red-300';
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4) return 'bg-teal-500/20 text-teal-300';
    if (rating >= 3) return 'bg-amber-500/20 text-amber-300';
    return 'bg-red-500/20 text-red-300';
  };

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="bg-red-500/20 p-8 rounded-2xl shadow-lg border border-red-500/30 w-full max-w-md">
          <h2 className="text-lg font-semibold text-red-200">Error al cargar</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button onClick={fetchReviews} className="w-full bg-gradient-to-r from-[#60caba] to-[#FFD700] text-black font-semibold py-3 px-4 rounded-xl">
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 p-6 mb-6 rounded-2xl shadow-lg border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#60caba]/80 to-[#FFD700]/80 p-3 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              Gestión de Reseñas
            </h1>
            <p className="text-gray-400 mt-1">Administra las opiniones de los clientes sobre tus productos</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              <button onClick={() => setViewMode('cards')} className={`px-3 py-2 rounded-md transition-all text-sm font-medium ${viewMode === 'cards' ? 'bg-white/10 shadow-md text-white' : 'text-gray-400 hover:text-white'}`}>Tarjetas</button>
              <button onClick={() => setViewMode('table')} className={`px-3 py-2 rounded-md transition-all text-sm font-medium ${viewMode === 'table' ? 'bg-white/10 shadow-md text-white' : 'text-gray-400 hover:text-white'}`}>Tabla</button>
            </div>
            <div className="text-sm text-gray-400 bg-white/5 border border-white/10 px-3 py-2 rounded-lg"><span className="font-medium text-gray-300">Total:</span> {reviews.length} reseñas</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#60caba] mx-auto mb-4"></div><p className="text-lg text-gray-400">Cargando reseñas...</p></div>
      ) : reviews.length === 0 ? (
        <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 p-12 rounded-2xl shadow-lg border border-white/10 text-center backdrop-blur-sm"><p className="text-gray-400 text-lg">No hay reseñas disponibles</p></div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 rounded-2xl shadow-lg border border-white/10 p-6 flex flex-col justify-between transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#60caba]/20 hover:border-[#60caba]/50">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-br from-[#60caba]/80 to-[#FFD700]/80 rounded-full w-12 h-12 flex items-center justify-center text-black font-bold text-lg">{review.userName[0]}</div>
                            <div>
                                <h3 className="font-bold text-gray-100">{review.userName}</h3>
                                <div className="flex items-center space-x-1">{renderStars(review.rating)}</div>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRatingBadge(review.rating)}`}>{review.rating >= 4 ? 'Excelente' : 'Bueno'}</span>
                    </div>
                    <blockquote className="bg-black/20 p-3 rounded-lg border-l-4 border-white/10 mt-2 mb-4">
                        <p className="text-gray-300 italic text-sm leading-relaxed break-words">"{review.comment || "Sin comentario"}"</p>
                    </blockquote>
                </div>
                <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="text-sm text-gray-500">Producto: <span className="font-medium text-gray-400">{review.product?.name || "N/A"}</span></div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{formatDate(review.createdAt)}</span>
                        <button onClick={() => handleDelete(review._id)} className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg transition-colors text-sm font-medium">Eliminar</button>
                    </div>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 rounded-2xl shadow-lg overflow-hidden border border-white/10 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white/5 border-b border-white/10"><tr><th className="px-4 py-3 text-left text-sm font-semibold text-gray-400 uppercase">Usuario</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-400 uppercase">Rating</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-400 uppercase">Producto</th><th className="px-4 py-3 text-center text-sm font-semibold text-gray-400 uppercase">Acciones</th></tr></thead>
              <tbody className="divide-y divide-white/10">
                {reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4"><div className="font-medium text-gray-100">{review.userName}</div><p className="text-gray-400 text-sm line-clamp-2">{review.comment}</p></td>
                    <td className="px-4 py-4"><div className="flex items-center">{renderStars(review.rating)}<span className={`ml-2 font-semibold ${getRatingColor(review.rating)}`}>{review.rating.toFixed(1)}</span></div></td>
                    <td className="px-4 py-4 text-sm text-gray-400">{review.product?.name || "N/A"}</td>
                    <td className="px-4 py-4 text-center"><button onClick={() => handleDelete(review._id)} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsAdmin;