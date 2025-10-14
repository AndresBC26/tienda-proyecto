// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ====================== MEJORA 1: INTERFAZ ACTUALIZADA ======================
// Se añade 'googleId' para que el frontend sepa si la cuenta está vinculada.
// ============================================================================
interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  googleId?: string; // Campo opcional para el ID de Google
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
}

// ====================== MEJORA 2: NUEVA FUNCIÓN EN EL TIPO ======================
// Se añade la firma de la nueva función 'linkWithGoogle'.
// ==============================================================================
interface AuthContextType extends AuthState {
  login: (credentials: any) => Promise<any>;
  loginWithGoogle: (token: string, intent: 'register' | 'login') => Promise<any>;
  logout: () => void;
  updateUserData: (data: { user: UserData; token: string }) => void;
  setCartDispatch: (dispatch: React.Dispatch<any>) => void;
  authenticateUser: (token: string, user: UserData) => void; 
  linkWithGoogle: (token: string) => Promise<void>; // <-- NUEVA FUNCIÓN
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

  const authenticateUser = (token: string, user: UserData) => {
    localStorage.setItem('token', token);
    setAuthState({ isAuthenticated: true, user: user, loading: false });
  };

  useEffect(() => {
    // ... Tu código de checkSession se mantiene igual ...
  }, []);

  // --- FUNCIÓN PARA INICIO DE SESIÓN CON CREDENCIALES (CORREGIDA) ---
  const login = async (credentials: any) => {
    if (!API_URL) throw new Error("REACT_APP_API_URL no está configurada. Revisa tu archivo .env");
    
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await res.json(); 

    if (!res.ok) throw new Error(data.message || 'Credenciales inválidas');
    
    authenticateUser(data.token, data.user);

    // ===================================================================
    // =====      ✅ ESTA ES LA LÍNEA QUE FALTABA Y SOLUCIONA TODO     =====
    // ===================================================================
    return data.user; 
    // ===================================================================
  };

  // --- FUNCIÓN PARA GOOGLE LOGIN ---
  const loginWithGoogle = async (token: string, intent: 'register' | 'login') => {
    if (!API_URL) throw new Error("REACT_APP_API_URL no está configurada.");

    try {
      const res = await fetch(`${API_URL}/api/users/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, intent }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error en el inicio de sesión con Google');
      
      authenticateUser(data.token, data.user);
      
      return { 
        ...data.user, 
        autoRegistered: !!data.message,
        welcomeMessage: data.message 
      };
    } catch (error) {
      console.error('❌ Error detallado en loginWithGoogle:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Error de conexión: No se puede conectar al servidor.');
      }
      throw error;
    }
  };
  
  // ========================================================================
  // =====      FUNCIÓN PARA VINCULAR CUENTAS (YA ESTÁ CORRECTA)         =====
  // ========================================================================
  const linkWithGoogle = async (token: string) => {
    const authToken = localStorage.getItem('token');
    if (!API_URL || !authToken) {
      throw new Error("No se pudo realizar la operación. Falta la URL de la API o la autenticación.");
    }
    
    const res = await fetch(`${API_URL}/api/users/link-google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Error al vincular la cuenta de Google.');
    }

    updateUserData(data); 
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
    setAuthState(prevState => ({ ...prevState, user: data.user }));
  };

  const setDispatch = (dispatch: React.Dispatch<any>) => {
    setCartDispatch(() => dispatch);
  };

  return (
    <AuthContext.Provider value={{ 
        ...authState, 
        login, 
        loginWithGoogle, 
        logout, 
        updateUserData, 
        setCartDispatch: setDispatch, 
        authenticateUser,
        linkWithGoogle
    }}>
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