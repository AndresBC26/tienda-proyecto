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
    <div className="min-h-screen flex flex-col overflow-hidden">
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
          isScrolled ? '-translate-y-8' : 'translate-y-0'
        }`}
      >
        <TopBanner />
        <Header />
      </div>

      <main className="flex-1 relative overflow-hidden pt-[170px] lg:pt-24">
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