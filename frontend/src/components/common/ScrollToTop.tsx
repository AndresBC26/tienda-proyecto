// src/components/common/ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  // Extrae el "pathname" (ej: "/products", "/about") de la URL actual
  const { pathname } = useLocation();

  // Este efecto se ejecutará cada vez que el "pathname" cambie
  useEffect(() => {
    // Le dice a la ventana del navegador que se desplace a la posición (0, 0) - la esquina superior izquierda.
    window.scrollTo(0, 0);
  }, [pathname]);

  // Este componente no necesita renderizar nada en la pantalla
  return null;
};

export default ScrollToTop;