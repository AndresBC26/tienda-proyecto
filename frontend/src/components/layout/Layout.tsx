// src/components/layout/Layout.tsx
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import TopBanner from '../common/TopBanner';
import { colors } from '../../utils/colors'; 

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0b0b0b] via-[#151515] to-[#0b0b0b]">
      <div className="fixed top-0 left-0 right-0 z-50">
        
        {/*
          ✅ MEJORA 1: Visibilidad del TopBanner con línea delgada (Universal).
          La clase 'max-h-1' ahora se aplica en TODOS los tamaños de pantalla
          cuando se hace scroll, garantizando el efecto de línea delgada.
        */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${     
            isScrolled ? 'max-h-1' : 'max-h-12' 
          }`}
        >
          <TopBanner />
        </div>
        <Header />
      </div>

      <main
        className={`flex-1 relative transition-all duration-300 ease-in-out ${
          /*
            ✅ MEJORA 2: Padding superior dinámico y universal.
            Se ajustan los valores para que funcionen consistentemente en todos
            los tamaños de pantalla, solucionando cualquier superposición.
          */
          isScrolled ? 'pt-36 lg:pt-24' : 'pt-48 lg:pt-32'
        }`}
      >
        {/* Se restauran los gradientes decorativos del fondo */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, ${colors.accent.cyan}20 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, ${colors.primary.main}20 0%, transparent 50%)
              `,
            }}
          />
        </div>
        <div className="relative z-10">{children}</div>
      </main>

      <Footer className="mt-auto" />
    </div>
  );
};

export default Layout;