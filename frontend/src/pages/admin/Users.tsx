// src/pages/admin/Users.tsx
import React, { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import { useNotification } from "../../contexts/NotificationContext"; // Importa el hook de notificación
import toast, { Toast } from 'react-hot-toast'; // Importa toast y el TIPO Toast

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  gender?: string;
  documentType?: string;
  documentNumber?: string;
  birthDate?: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const UsersAdmin: React.FC = () => {
  const { notify } = useNotification(); // Inicializa el hook
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error ${res.status}`);
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cargar usuarios: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "user" });
    setIsOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser ? `${API_URL}/api/users/${editingUser._id}` : `${API_URL}/api/users/register`;
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error ${res.status}`);
      }
      
      notify(editingUser ? 'Usuario actualizado exitosamente' : 'Usuario agregado exitosamente', 'success');
      fetchUsers();
      setIsOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      notify(`Error al guardar usuario: ${errorMessage}`, 'error');
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        notify('No se encontró tu sesión. Por favor, inicia sesión de nuevo.', 'error');
        return;
      }

      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
      }

      setUsers(users.filter((u) => u._id !== id));
      notify('Usuario eliminado exitosamente.', 'success');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      notify(`Error al eliminar usuario: ${errorMessage}`, 'error');
    }
  };

  const deleteUser = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Evita que se abra el modal de edición
    notify(
      (t: Toast) => (
        <div className="text-white p-2">
          <p className="font-bold mb-2">¿Confirmas la eliminación?</p>
          <p className="text-sm text-gray-400 mb-4">Esta acción no se puede deshacer.</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleConfirmDelete(id);
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-all"
            >
              Eliminar
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      ),
      'info',
      {
        duration: 6000,
      }
    );
  };
  
  const getGenderIcon = (gender?: string) => gender?.toLowerCase().startsWith('m') ? '👨' : gender?.toLowerCase().startsWith('f') ? '👩' : '👤';

  if (error) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 p-8 rounded-2xl shadow-lg border border-white/10 w-full max-w-md backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-red-200">Error al cargar</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button onClick={fetchUsers} className="w-full py-3 px-4 rounded-2xl text-black bg-gradient-to-r from-[#60caba] to-[#FFD700] hover:from-[#58b7a9] hover:to-[#E6C600]">Intentar de nuevo</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 p-6 mb-6 rounded-2xl shadow-lg border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#60caba]/80 to-[#FFD700]/80 p-3 rounded-xl"><svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg></div>
              Gestión de Usuarios
            </h1>
            <p className="text-gray-400 mt-1">Administra los usuarios de tu sistema</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              <button onClick={() => setViewMode('cards')} className={`px-3 py-2 rounded-md transition-all text-sm font-medium ${viewMode === 'cards' ? 'bg-white/10 shadow-md text-white' : 'text-gray-400 hover:text-white'}`}>Tarjetas</button>
              <button onClick={() => setViewMode('table')} className={`px-3 py-2 rounded-md transition-all text-sm font-medium ${viewMode === 'table' ? 'bg-white/10 shadow-md text-white' : 'text-gray-400 hover:text-white'}`}>Tabla</button>
            </div>
            <div className="text-sm text-gray-400 bg-white/5 border border-white/10 px-3 py-2 rounded-lg"><span className="font-medium text-gray-300">Total:</span> {users.length} usuarios</div>
          </div>
        </div>
      </div>
      
      <div className="mb-6"><button onClick={openAddModal} className="text-black bg-gradient-to-r from-[#60caba] to-[#FFD700] hover:from-[#58b7a9] hover:to-[#E6C600] font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg><span>Agregar Usuario</span></button></div>

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#60caba] mx-auto mb-4"></div><div className="text-lg text-gray-400">Cargando usuarios...</div></div>
      ) : users.length === 0 ? (
        <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 p-12 rounded-2xl shadow-lg border border-white/10 text-center backdrop-blur-sm"><p className="text-gray-400 text-lg">No hay usuarios disponibles</p></div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div 
                key={user._id} 
                className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 rounded-2xl shadow-lg border border-white/10 p-6 space-y-4
                transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#60caba]/20 hover:border-[#60caba]/50 cursor-pointer"
                onClick={() => openEditModal(user)}
            >
              <div className="flex items-center space-x-3"><div className="bg-gradient-to-br from-[#60caba]/80 to-[#FFD700]/80 rounded-full w-12 h-12 flex items-center justify-center text-lg">{getGenderIcon(user.gender)}</div><div><h3 className="font-bold text-gray-100 text-lg">{user.name}</h3><span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-red-500/20 text-red-300' : 'bg-teal-500/20 text-teal-300'}`}>{user.role}</span></div></div>
              <p className="text-sm text-gray-400">{user.email}</p>
              {/* --- ✅ CAMBIO 1: Se mantienen los botones en la tarjeta --- */}
              <div className="flex space-x-2 pt-4 border-t border-white/10">
                <button 
                  onClick={(e) => { e.stopPropagation(); openEditModal(user); }} 
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg transition-colors text-sm font-medium"
                >
                  Editar
                </button>
                <button 
                  onClick={(e) => deleteUser(e, user._id)} 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg transition-colors text-sm font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 rounded-2xl shadow-lg overflow-hidden border border-white/10 backdrop-blur-sm">
          <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">Usuario</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">Rol</th>
                        <th className="text-center px-4 py-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <tr 
                      key={user._id} 
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => openEditModal(user)}
                    >
                      <td className="px-4 py-4">
                          <div className="flex items-center space-x-3">
                              <div className="bg-gradient-to-br from-[#60caba]/80 to-[#FFD700]/80 rounded-full h-10 w-10 flex-shrink-0 flex items-center justify-center text-lg">{getGenderIcon(user.gender)}</div>
                              <div>
                                  <div className="font-medium text-gray-100">{user.name}</div>
                                  <div className="text-gray-400 text-sm">{user.email}</div>
                              </div>
                          </div>
                      </td>
                      <td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-red-500/20 text-red-300' : 'bg-teal-500/20 text-teal-300'}`}>{user.role}</span></td>
                      <td className="px-4 py-4 text-center space-x-2">
                          {/* --- ✅ CAMBIO 2: Se mantienen los botones en la tabla --- */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); openEditModal(user); }} 
                            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                          >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                          </button>
                          <button 
                            onClick={(e) => deleteUser(e, user._id)} 
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                          >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </div>
      )}
      
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editingUser ? "Editar Usuario" : "Agregar Usuario"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Nombre *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#60caba]" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Email *</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#60caba]" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Rol *</label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#60caba]" required>
              <option className="bg-[#151515]" value="user">Usuario</option>
              <option className="bg-[#151515]" value="admin">Administrador</option>
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-gray-200 rounded-xl transition-colors font-medium">Cancelar</button>
            <button type="submit" className="px-6 py-3 bg-gradient-to-r from-[#60caba] to-[#FFD700] hover:from-[#58b7a9] hover:to-[#E6C600] text-black rounded-xl font-semibold transition-all transform hover:scale-105">Guardar Cambios</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersAdmin;