// src/hooks/useScrollVisibility.ts
import { useState, useEffect } from 'react';

export const useScrollVisibility = (threshold: number = 100) => {
  const [isVisible, setIsVisible] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      // En pantallas móviles (menos de 768px), ocultar después del threshold
      if (window.innerWidth < 768) {
        setIsVisible(currentScrollY < threshold);
      } else {
        // En desktop, siempre visible
        setIsVisible(true);
      }
    };

    // Verificar el tamaño inicial de la pantalla
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [threshold]);

  return { isVisible, scrollY };
};
