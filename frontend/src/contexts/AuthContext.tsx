// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Interfaces para definir los tipos de datos
interface AuthState {
  isAuthenticated: boolean;
  user: {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
  } | null;
  loading: boolean;
}

// 🔹 CORRECCIÓN: Se añade 'loginWithGoogle' y 'updateUserData' a la interfaz
interface AuthContextType extends AuthState {
  login: (credentials: any) => Promise<any>;
  loginWithGoogle: (token: string) => Promise<any>; // <-- AÑADIDO
  logout: () => void;
  updateUserData: (data: { user: any; token: string }) => void;
  setCartDispatch: (dispatch: React.Dispatch<any>) => void;
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

  useEffect(() => {
    const checkSession = async () => {
      if (isCheckingSession) return;
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          isCheckingSession = true;
          if (!API_URL) throw new Error("REACT_APP_API_URL no está configurada. Revisa tu archivo .env");

          const res = await fetch(`${API_URL}/api/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (res.ok) {
            const user = await res.json();
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

  const login = async (credentials: any) => {
    if (!API_URL) throw new Error("REACT_APP_API_URL no está configurada. Revisa tu archivo .env");
    
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await res.json(); 

    if (!res.ok) throw new Error(data.message || 'Credenciales inválidas');
    localStorage.setItem('token', data.token);
    setAuthState({ isAuthenticated: true, user: data.user, loading: false });
    return data.user;
  };

  // --- FUNCIÓN NUEVA PARA GOOGLE LOGIN ---
  const loginWithGoogle = async (token: string) => {
    if (!API_URL) throw new Error("REACT_APP_API_URL no está configurada.");

    const res = await fetch(`${API_URL}/api/users/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Error en el inicio de sesión con Google');
    
    localStorage.setItem('token', data.token);
    setAuthState({ isAuthenticated: true, user: data.user, loading: false });
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({ isAuthenticated: false, user: null, loading: false });
    if (cartDispatch) {
      cartDispatch({ type: 'CLEAR_CART' });
    }
  };

  const updateUserData = (data: { user: any; token: string }) => {
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
    <AuthContext.Provider value={{ ...authState, login, loginWithGoogle, logout, updateUserData, setCartDispatch: setDispatch }}>
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