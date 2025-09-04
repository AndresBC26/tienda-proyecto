// src/components/layout/Layout.tsx
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { colors, gradients } from '../../utils/colors'; // ✅ importa la paleta

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={`min-h-screen flex flex-col ${colors.background}`}>
      {/* HEADER */}
      <Header />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 relative">
        {/* Patrón de fondo usando gradientes de la paleta */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, ${colors.accent}20 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, ${colors.primary}20 0%, transparent 50%)
              `,
            }}
          />
        </div>

        {/* Contenido real */}
        <div className="relative z-10">{children}</div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Layout;
