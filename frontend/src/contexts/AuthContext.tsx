// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthState { isAuthenticated: boolean; user: { _id: string; name: string; email: string; role: 'user' | 'admin'; } | null; loading: boolean; }
interface AuthContextType extends AuthState { login: (credentials: any) => Promise<any>; logout: () => void; setCartDispatch: (dispatch: React.Dispatch<any>) => void; }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.REACT_APP_API_URL;

// Usamos una variable externa para evitar que múltiples refrescos inicien la verificación a la vez
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
      // 1. MEJORA: Si ya se está verificando la sesión, no hacemos nada.
      if (isCheckingSession) {
        return;
      }
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Marcamos que la verificación ha comenzado
          isCheckingSession = true;

          if (!API_URL) throw new Error("REACT_APP_API_URL no está configurada. Revisa tu archivo .env");

          const res = await fetch(`${API_URL}/api/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (res.ok) {
            const user = await res.json();
            setAuthState({ isAuthenticated: true, user, loading: false });
          } else {
            // Si la respuesta no es OK, el token es inválido, así que lo borramos.
            localStorage.removeItem('token');
            setAuthState({ isAuthenticated: false, user: null, loading: false });
          }
        } catch (error) {
          // 2. MEJORA: Si hay un error de red, NO borramos el token.
          // Simplemente dejamos de cargar, pero el token sigue ahí para el próximo intento.
          console.error("Fallo al verificar la sesión (posiblemente por red):", error);
          setAuthState(prev => ({ ...prev, loading: false }));
        } finally {
          // Al final (éxito o fallo), marcamos que la verificación ha terminado.
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

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({ isAuthenticated: false, user: null, loading: false });
    if (cartDispatch) {
      cartDispatch({ type: 'CLEAR_CART' });
    }
  };

  const setDispatch = (dispatch: React.Dispatch<any>) => {
    setCartDispatch(() => dispatch);
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, setCartDispatch: setDispatch }}>
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