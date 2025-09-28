// src/contexts/NotificationContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import toast, { Toaster, ToastOptions, Toast, Renderable } from 'react-hot-toast';

type NotificationType = 'success' | 'error' | 'info';

// Definimos que el mensaje puede ser un nodo de React o una función que devuelve uno
interface NotificationContextType {
  notify: (message: Renderable | ((t: Toast) => Renderable), type?: NotificationType, options?: ToastOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de un NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const notify = (message: Renderable | ((t: Toast) => Renderable), type: NotificationType = 'info', options: ToastOptions = {}) => {
    const toastOptions: ToastOptions = {
      duration: 4000,
      position: 'top-center',
      style: {
        background: '#151515',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        minWidth: '250px',
        fontSize: '15px',
        padding: '16px',
      },
      ...options,
    };

    // ========================================================================
    // =====                ✅ INICIO DE LA CORRECCIÓN FINAL                =====
    // ========================================================================

    // La función genérica toast() es la única que acepta una función como argumento.
    // Los otros (success, error) solo aceptan string o JSX.
    if (typeof message === 'function') {
      toast(message, toastOptions);
      return;
    }

    // Para los demás casos, usamos el switch.
    switch (type) {
      case 'success':
        toast.success(message, {
          ...toastOptions,
          iconTheme: {
            primary: '#60caba',
            secondary: '#151515',
          },
        });
        break;
      case 'error':
        toast.error(message, {
          ...toastOptions,
          iconTheme: {
            primary: '#EF4444',
            secondary: '#151515',
          },
        });
        break;
      case 'info':
      default:
        toast(message, toastOptions);
        break;
    }
    
    // ========================================================================
    // =====                 FIN DE LA CORRECCIÓN FINAL                   =====
    // ========================================================================
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <Toaster />
    </NotificationContext.Provider>
  );
};