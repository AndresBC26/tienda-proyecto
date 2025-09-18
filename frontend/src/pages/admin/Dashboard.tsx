// src/pages/admin/Dashboard.tsx
import React from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const salesData = [
  { month: 'Ene', ventas: 4000 },
  { month: 'Feb', ventas: 3000 },
  { month: 'Mar', ventas: 5000 },
  { month: 'Abr', ventas: 4500 },
  { month: 'May', ventas: 6000 },
  { month: 'Jun', ventas: 7000 },
];

const usersData = [
  { month: 'Ene', nuevos: 200 },
  { month: 'Feb', nuevos: 150 },
  { month: 'Mar', nuevos: 300 },
  { month: 'Abr', nuevos: 250 },
  { month: 'May', nuevos: 400 },
  { month: 'Jun', nuevos: 500 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-100">
        📊 Panel de Control
      </h1>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-lg">
          <h2 className="text-sm text-gray-400">Ventas Totales</h2>
          <p className="text-3xl font-bold mt-2 text-white">$35,000</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-lg">
          <h2 className="text-sm text-gray-400">Usuarios Registrados</h2>
          <p className="text-3xl font-bold mt-2 text-white">1,200</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-lg">
          <h2 className="text-sm text-gray-400">Productos</h2>
          <p className="text-3xl font-bold mt-2 text-white">320</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-lg">
          <h2 className="text-sm text-gray-400">Ingresos Mes</h2>
          <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">$7,000</p>
        </div>
      </div>

      {/* Gráfica de ventas */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-white">Ventas por Mes</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <Line type="monotone" dataKey="ventas" stroke="#60caba" strokeWidth={3} />
              <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="5 5" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfica de usuarios */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-white">Usuarios Nuevos por Mes</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usersData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <Bar dataKey="nuevos" fill="#FFD700" />
              <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="5 5" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px' }}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;