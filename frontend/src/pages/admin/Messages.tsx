// src/pages/admin/Messages.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

const MessagesAdmin: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // ✅ SOLUCIÓN CORRECTA PARA CREATE REACT APP
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/contact`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Ordenar los mensajes por fecha, los más recientes primero
      const sortedMessages = res.data.sort((a: Message, b: Message) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setMessages(sortedMessages);
    } catch (err) {
      setError('Error al cargar los mensajes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar este mensaje?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/api/contact/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setMessages(messages.filter(m => m._id !== id));
        setSelectedMessage(null);
      } catch (err) {
        alert('Error al eliminar el mensaje.');
      }
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#60caba]"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 text-center p-8">{error}</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 p-6 mb-6 rounded-2xl shadow-lg border border-white/10 backdrop-blur-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#60caba]/80 to-[#FFD700]/80 p-3 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
            </div>
            Bandeja de Entrada
        </h1>
        <p className="text-gray-400 mt-1">Revisa los mensajes de tus clientes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de Mensajes */}
        <div className="md:col-span-1 bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 rounded-2xl shadow-lg border border-white/10 p-4 space-y-3 h-[75vh] overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center pt-10">No hay mensajes.</p>
          ) : (
            messages.map(msg => (
              <div
                key={msg._id}
                onClick={() => setSelectedMessage(msg)}
                className={`p-4 rounded-xl cursor-pointer border-l-4 transition-all duration-200 ${
                  selectedMessage?._id === msg._id
                    ? 'bg-white/10 border-[#60caba] shadow-md'
                    : 'border-transparent hover:bg-white/5'
                }`}
              >
                <div className="flex justify-between items-center">
                  <p className="font-bold text-gray-100">{msg.name}</p>
                  <span className="text-xs text-gray-500">{formatDate(msg.createdAt).split(',')[0]}</span>
                </div>
                <p className="text-sm font-semibold text-gray-300 truncate">{msg.subject}</p>
                <p className="text-sm text-gray-400 truncate">{msg.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Vista del Mensaje Seleccionado */}
        <div className="md:col-span-2 bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 rounded-2xl shadow-lg border border-white/10 p-6 h-[75vh] flex flex-col">
          {selectedMessage ? (
            <>
              <div className="border-b border-white/10 pb-4 mb-4">
                <h2 className="text-2xl font-bold text-white">{selectedMessage.subject}</h2>
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <p className="text-gray-300">De: <span className="font-semibold text-gray-100">{selectedMessage.name}</span></p>
                    <p className="text-gray-400 text-sm">&lt;{selectedMessage.email}&gt;</p>
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(selectedMessage.createdAt)}</span>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto text-gray-300 leading-relaxed pr-2">
                <p>{selectedMessage.message}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => handleDelete(selectedMessage._id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-xl transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  <span>Eliminar</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-16 h-16 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21.75 9.75v5.25a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V9.75m19.5 0A2.25 2.25 0 0019.5 7.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 11.91a2.25 2.25 0 01-1.07-1.916V9.75" />
              </svg>
              <p className="text-gray-500 text-lg">Selecciona un mensaje para leerlo</p>
              <p className="text-gray-600 text-sm">Los mensajes más recientes aparecerán aquí.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesAdmin;