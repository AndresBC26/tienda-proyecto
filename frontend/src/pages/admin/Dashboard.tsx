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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        📊 Panel de Control
      </h1>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
          <h2 className="text-sm text-gray-500 dark:text-gray-400">Ventas Totales</h2>
          <p className="text-3xl font-bold mt-2">$35,000</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
          <h2 className="text-sm text-gray-500 dark:text-gray-400">Usuarios Registrados</h2>
          <p className="text-3xl font-bold mt-2">1,200</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
          <h2 className="text-sm text-gray-500 dark:text-gray-400">Productos</h2>
          <p className="text-3xl font-bold mt-2">320</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
          <h2 className="text-sm text-gray-500 dark:text-gray-400">Ingresos Mes</h2>
          <p className="text-3xl font-bold mt-2">$7,000</p>
        </div>
      </div>

      {/* Gráfica de ventas */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Ventas por Mes</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <Line type="monotone" dataKey="ventas" stroke="#5FCDD9" strokeWidth={3} />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfica de usuarios */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Usuarios Nuevos por Mes</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usersData}>
              <Bar dataKey="nuevos" fill="#9333EA" />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

