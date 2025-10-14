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
            const user: UserData = await res.json();
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
    // ... Tu lógica de login actual (sin cambios) ...
  };

  const loginWithGoogle = async (token: string, intent: 'register' | 'login') => {
    // ... Tu lógica de loginWithGoogle actual (sin cambios) ...
  };
  
  // ========================================================================
  // =====      ✅ INICIO DE LA MEJORA: FUNCIÓN PARA VINCULAR CUENTAS     =====
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
        'Authorization': `Bearer ${authToken}`, // Envía el token de la sesión actual
      },
      body: JSON.stringify({ token }), // Envía el token de Google
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Error al vincular la cuenta de Google.');
    }

    // Actualiza el estado global con la nueva información del usuario (incluyendo googleId)
    // Esto hará que la UI reaccione y muestre el estado "Conectado".
    updateUserData(data); 
  };
  // ========================================================================
  // =====       FIN DE LA MEJORA: FUNCIÓN PARA VINCULAR CUENTAS        =====
  // ========================================================================


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
    <AuthContext.Provider value={{ 
        ...authState, 
        login, 
        loginWithGoogle, 
        logout, 
        updateUserData, 
        setCartDispatch: setDispatch, 
        authenticateUser,
        linkWithGoogle // <-- Se exporta la nueva función
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