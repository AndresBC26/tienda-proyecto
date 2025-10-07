// src/pages/admin/Dashboard.tsx
import React from 'react';
import { useDashboardStats } from '../../hooks/useDashboardStats';
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

// Función para formatear números como moneda colombiana (COP)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
};

// Nombres de los meses para las gráficas
const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];


// ========================================================================
// =====      ✅ INICIO DE LA MEJORA: COMPONENTE DE TOOLTIP CUSTOM      =====
// ========================================================================
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/70 backdrop-blur-sm border border-white/20 p-3 rounded-xl shadow-lg">
        <p className="label text-sm font-bold text-white">{`${label}`}</p>
        <p className="intro text-xs" style={{ color: payload[0].fill }}>
          {`Nuevos Usuarios : ${payload[0].value}`}
        </p>
      </div>
    );
  }
  return null;
};
// ========================================================================
// =====       FIN DE LA MEJORA: COMPONENTE DE TOOLTIP CUSTOM         =====
// ========================================================================


const Dashboard: React.FC = () => {
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#60caba]"></div>
        <p className="mt-4 text-lg text-gray-300">Cargando estadísticas del dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 p-6 rounded-2xl text-red-200 text-center border border-red-500/30">
        <h2 className="text-xl font-bold mb-2">Error al Cargar el Dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  const salesChartData = stats?.salesByMonth.map(item => ({
    month: monthNames[item._id.month - 1],
    ventas: item.totalVentas || 0,
  })) || [];

  const usersChartData = stats?.usersByMonth.map(item => ({
    month: monthNames[item._id.month - 1],
    nuevos: item.count || 0,
  })) || [];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-100">
        📊 Panel de Control
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-lg">
          <h2 className="text-sm text-gray-400">Ventas Totales</h2>
          <p className="text-3xl font-bold mt-2 text-white">{formatCurrency(stats?.totalSales || 0)}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-lg">
          <h2 className="text-sm text-gray-400">Usuarios Registrados</h2>
          <p className="text-3xl font-bold mt-2 text-white">{(stats?.totalUsers || 0).toLocaleString('es-CO')}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-lg">
          <h2 className="text-sm text-gray-400">Productos</h2>
          <p className="text-3xl font-bold mt-2 text-white">{(stats?.totalProducts || 0).toLocaleString('es-CO')}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-lg">
          <h2 className="text-sm text-gray-400">Ingresos Mes</h2>
          <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-[#60caba] to-[#FFD700] bg-clip-text text-transparent">
            {formatCurrency(stats?.monthlyIncome || 0)}
          </p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-white">Ventas por Mes</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <Line type="monotone" dataKey="ventas" stroke="#60caba" strokeWidth={3} />
              <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="5 5" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${Number(value).toLocaleString('es-CO', { notation: 'compact' })}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px' }}
                formatter={(value: number) => [formatCurrency(value), 'Ventas']}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ======================================================================== */}
      {/* =====        ✅ INICIO DE LA MEJORA: GRÁFICA DE USUARIOS           ===== */}
      {/* ======================================================================== */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-white">Usuarios Nuevos por Mes</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usersChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              
              {/* 1. Definición del gradiente */}
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#60caba" stopOpacity={0.8}/>
                </linearGradient>
              </defs>

              <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="5 5" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" allowDecimals={false} />

              {/* 2. Tooltip personalizado y cursor de hover */}
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255, 255, 255, 0.08)'}} />

              {/* 3. Barra con gradiente, bordes redondeados y efecto de hover */}
              <Bar 
                dataKey="nuevos" 
                fill="url(#colorUsers)" 
                radius={[10, 10, 0, 0]} 
                activeBar={{ fill: 'rgba(255, 215, 0, 0.5)' }} 
              />

            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* ======================================================================== */}
      {/* =====         FIN DE LA MEJORA: GRÁFICA DE USUARIOS              ===== */}
      {/* ======================================================================== */}
    </div>
  );
};

export default Dashboard;