// src/utils/api.ts
import axios from 'axios';

// ✅ CÓDIGO CORREGIDO PARA VITE
const API_BASE_URL = process.env.REACT_APP_API_URL;


if (!API_BASE_URL) {
  throw new Error("La variable de entorno VITE_API_URL no está definida. Revisa tu archivo .env");
}

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});

export default api;