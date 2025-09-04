import React, { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";

interface User {
  _id: string; // Mongo usa _id
  name: string;
  email: string;
  role: string;
}

const UsersAdmin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form
  const [formData, setFormData] = useState({ name: "", email: "", role: "" });

  // 🔹 Manejo robusto de la variable de entorno
  const getApiUrl = () => {
    // Verifica si import.meta.env existe
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.VITE_API_URL || 'http://localhost:5000';
    }
    
    // Fallback si import.meta no está disponible
    return process.env.REACT_APP_API_URL || 'http://localhost:5000';
  };

  const API_URL = getApiUrl();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Usando API_URL para fetch:', API_URL);
      const res = await fetch(`${API_URL}/api/users`);
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error("Error fetching users:", err);
      setError(`Error al cargar usuarios: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "" });
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
      console.log('Usando API_URL para submit:', API_URL);
      
      if (editingUser) {
        // Editar
        const res = await fetch(`${API_URL}/api/users/${editingUser._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        setUsers(users.map((u) => (u._id === editingUser._id ? { ...u, ...formData } : u)));
      } else {
        // Agregar
        const res = await fetch(`${API_URL}/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const newUser = await res.json();
        setUsers([...users, newUser]);
      }
      
      setIsOpen(false);
      setFormData({ name: "", email: "", role: "" });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error("Error saving user:", err);
      alert(`Error al guardar usuario: ${errorMessage}`);
    }
  };

  const deleteUser = async (id: string) => {
    if (window.confirm("¿Seguro que quieres eliminar este usuario?")) {
      try {
        console.log('Usando API_URL para delete:', API_URL);
        const res = await fetch(`${API_URL}/api/users/${id}`, { method: "DELETE" });
        
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        setUsers(users.filter((u) => u._id !== id));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error("Error deleting user:", err);
        alert(`Error al eliminar usuario: ${errorMessage}`);
      }
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={fetchUsers}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">👥 Usuarios</h1>
        <div className="text-sm text-gray-600">
          API: {API_URL}
        </div>
      </div>

      <button
        className="mb-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-200 shadow-md hover:shadow-lg"
        onClick={openAddModal}
      >
        ➕ Agregar Usuario
      </button>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Cargando usuarios...</div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay usuarios disponibles</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border rounded-xl shadow-lg">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Rol</th>
                <th className="px-4 py-3 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                  <td className="px-4 py-3 font-mono text-sm">{user._id}</td>
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-blue-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                      user.role === 'user' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition duration-200 text-sm"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition duration-200 text-sm"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingUser ? "Editar Usuario" : "Agregar Usuario"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              placeholder="Ingresa el nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="usuario@ejemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona un rol</option>
              <option value="admin">Admin</option>
              <option value="user">Usuario</option>
              <option value="moderator">Moderador</option>
            </select>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
            >
              {editingUser ? "💾 Guardar Cambios" : "➕ Agregar"}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersAdmin;