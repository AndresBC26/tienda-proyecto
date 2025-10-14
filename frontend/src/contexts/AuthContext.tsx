// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Interfaces (sin cambios)
interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  googleId?: string; 
  hasPassword?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: any) => Promise<any>;
  loginWithGoogle: (token: string, intent: 'register' | 'login') => Promise<any>;
  logout: () => void;
  updateUserData: (data: { user: UserData; token: string }) => void;
  setCartDispatch: (dispatch: React.Dispatch<any>) => void;
  authenticateUser: (token: string, user: UserData) => void; 
  linkWithGoogle: (token: string) => Promise<void>;
  unlinkGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.REACT_APP_API_URL;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true, // Inicia en 'true' para mostrar carga mientras se verifica la sesión
  });
  const [cartDispatch, setCartDispatch] = useState<React.Dispatch<any> | null>(null);

  const authenticateUser = (token: string, user: UserData) => {
    localStorage.setItem('token', token);
    setAuthState({ isAuthenticated: true, user: user, loading: false });
  };

  // =================================================================================
  // =====      ✅ MEJORA CLAVE: LÓGICA PARA VERIFICAR Y RESTAURAR LA SESIÓN      =====
  // =================================================================================
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          if (!API_URL) throw new Error("API URL no está configurada");
          
          const res = await fetch(`${API_URL}/api/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const user = await res.json();
            // Restaura la sesión con los datos más recientes del backend
            authenticateUser(token, user);
          } else {
            // Si el token es inválido o expiró, se limpia todo
            localStorage.removeItem('token');
            setAuthState({ isAuthenticated: false, user: null, loading: false });
          }
        } catch (error) {
          console.error("Error al verificar la sesión:", error);
          localStorage.removeItem('token');
          setAuthState({ isAuthenticated: false, user: null, loading: false });
        }
      } else {
        // Si no hay token, simplemente se termina la carga
        setAuthState(prevState => ({ ...prevState, loading: false }));
      }
    };

    checkSession();
  }, []); // El array vacío asegura que esto solo se ejecute una vez al montar el componente

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
    
    authenticateUser(data.token, data.user);
    return data.user; 
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
  
  // --- FUNCIÓN PARA VINCULAR CUENTAS CON GOOGLE ---
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

  // --- FUNCIÓN PARA DESVINCULAR CUENTA DE GOOGLE ---
  const unlinkGoogle = async () => {
    const authToken = localStorage.getItem('token');
    if (!API_URL || !authToken) {
      throw new Error("Operación no permitida. Se requiere autenticación.");
    }

    const res = await fetch(`${API_URL}/api/users/unlink-google`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Error al desvincular la cuenta de Google.');
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
        linkWithGoogle,
        unlinkGoogle
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