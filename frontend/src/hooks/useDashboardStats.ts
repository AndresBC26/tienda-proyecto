// src/hooks/useDashboardStats.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

// Interfaces para asegurar que los datos que recibimos de la API tengan la estructura correcta
interface MonthlyDataPoint {
  _id: {
    year: number;
    month: number;
  };
  totalVentas?: number; // Para ventas
  count?: number;      // Para usuarios
}

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalSales: number;
  monthlyIncome: number;
  salesByMonth: MonthlyDataPoint[];
  usersByMonth: MonthlyDataPoint[];
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No estás autenticado. Inicia sesión de nuevo.');
        }

        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        
        // Hacemos la llamada al nuevo endpoint que creamos en el backend
        const response = await axios.get<DashboardStats>(`${API_URL}/api/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setStats(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Ocurrió un error al cargar las estadísticas.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};