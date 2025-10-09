// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Define la interfaz UserData para un mejor tipado
interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
}

// 2. Define el AuthContextType incluyendo la nueva firma para loginWithGoogle
interface AuthContextType extends AuthState {
  login: (credentials: any) => Promise<any>;
  // 👇 CAMBIO 1: La función ahora espera el parámetro 'intent'
  loginWithGoogle: (token: string, intent: 'register' | 'login') => Promise<any>;
  logout: () => void;
  // Usamos UserData en updateUserData y en la nueva función
  updateUserData: (data: { user: UserData; token: string }) => void;
  setCartDispatch: (dispatch: React.Dispatch<any>) => void;
  // 🔑 FUNCIÓN CLAVE: Para auto-login (verifica email)
  authenticateUser: (token: string, user: UserData) => void; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.REACT_APP_API_URL;
let isCheckingSession = false;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });
  const [cartDispatch, setCartDispatch] = useState<React.Dispatch<any> | null>(null);

  // 3. Implementación de authenticateUser
  const authenticateUser = (token: string, user: UserData) => {
    localStorage.setItem('token', token);
    setAuthState({ isAuthenticated: true, user: user, loading: false });
  };

  useEffect(() => {
    const checkSession = async () => {
      if (isCheckingSession) return;
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          isCheckingSession = true;
          if (!API_URL) throw new Error("REACT_APP_API_URL no está configurada. Revisa tu archivo .env");

          // Asegúrate de que este endpoint '/api/users/me' devuelve la estructura UserData
          const res = await fetch(`${API_URL}/api/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (res.ok) {
            const user: UserData = await res.json(); // Tipamos el resultado
            setAuthState({ isAuthenticated: true, user, loading: false });
          } else {
            localStorage.removeItem('token');
            setAuthState({ isAuthenticated: false, user: null, loading: false });
          }
        } catch (error) {
          console.error("Fallo al verificar la sesión (posiblemente por red):", error);
          setAuthState(prev => ({ ...prev, loading: false }));
        } finally {
          isCheckingSession = false;
        }
      } else {
        setAuthState({ isAuthenticated: false, user: null, loading: false });
      }
    };
    checkSession();
  }, []);

  // --- FUNCIÓN PARA INICIO DE SESIÓN CON CREDENCIALES ---
  const login = async (credentials: any) => {
    if (!API_URL) throw new Error("REACT_APP_API_URL no está configurada. Revisa tu archivo .env");
    
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await res.json(); 

    if (!res.ok) throw new Error(data.message || 'Credenciales inválidas');
    
    // Usamos authenticateUser para manejar el guardado del estado
    authenticateUser(data.token, data.user);
    return data.user;
  };

  // --- FUNCIÓN PARA GOOGLE LOGIN (MODIFICADA) ---
  // 👇 CAMBIO 2: Se añade el parámetro 'intent' a la función
  const loginWithGoogle = async (token: string, intent: 'register' | 'login') => {
    if (!API_URL) throw new Error("REACT_APP_API_URL no está configurada.");

    const res = await fetch(`${API_URL}/api/users/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // 👇 CAMBIO 3: Se envía el 'intent' al backend
      body: JSON.stringify({ token, intent }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Error en el inicio de sesión con Google');
    
    // Usamos authenticateUser para manejar el guardado del estado
    authenticateUser(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({ isAuthenticated: false, user: null, loading: false });
    if (cartDispatch) {
      cartDispatch({ type: 'CLEAR_CART' });
    }
  };

  const updateUserData = (data: { user: UserData; token: string }) => {
    localStorage.setItem('token', data.token);
    setAuthState(prevState => ({
      ...prevState,
      user: data.user,
    }));
  };

  const setDispatch = (dispatch: React.Dispatch<any>) => {
    setCartDispatch(() => dispatch);
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, loginWithGoogle, logout, updateUserData, setCartDispatch: setDispatch, authenticateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};