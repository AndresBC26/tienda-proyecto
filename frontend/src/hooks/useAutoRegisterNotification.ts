// src/hooks/useAutoRegisterNotification.ts
import { useEffect } from 'react';
import toast from 'react-hot-toast';

interface AutoRegisterUser {
  autoRegistered?: boolean;
  welcomeMessage?: string;
  role?: string;
  [key: string]: any;
}

export const useAutoRegisterNotification = (user: AutoRegisterUser | null, navigate: (path: string) => void) => {
  useEffect(() => {
    if (user?.autoRegistered && user?.welcomeMessage) {
      // Mostrar notificación de bienvenida
      toast.success(user.welcomeMessage, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: 'bold',
        },
        icon: '🎉',
      });

      // Redirigir después de mostrar la notificación
      const timer = setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [user, navigate]);
};
