import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  const location = useLocation();

  const linkClass = (path: string) =>
    `block px-4 py-2 rounded transition duration-200 ${
      location.pathname === path
        ? 'bg-[#339f96] text-white shadow-md'
        : 'hover:bg-gray-700 text-gray-200 hover:text-white'
    }`;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-4 shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-[#339f96]">🛍️ Admin</h1>
        <nav className="space-y-2">
          <Link to="/admin" className={linkClass('/admin')}>
            📊 Dashboard
          </Link>
          {/* 🔹 Corregido: era /admin/Products, ahora es /admin/products */}
          <Link to="/admin/products" className={linkClass('/admin/products')}>
            👕 Productos
          </Link>
          <Link to="/admin/users" className={linkClass('/admin/users')}>
            👤 Usuarios
          </Link>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 dark:text-white">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;