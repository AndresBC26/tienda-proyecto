// src/components/common/Modal.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'xl',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !isMounted) {
    return null;
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'md': return 'max-w-2xl';
      case 'lg': return 'max-w-4xl';
      case 'xl': return 'max-w-6xl';
      case 'full': return 'max-w-full mx-4';
      default: return 'max-w-6xl';
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className={`relative w-full ${getSizeClasses()} my-8`}>
            {/* Contenedor principal del Modal con el nuevo estilo oscuro */}
            <div className={`bg-gradient-to-br from-[#0b0b0b]/90 via-[#151515]/90 to-[#0b0b0b]/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10 overflow-hidden ${className}`}>
              {/* Header del Modal */}
              <div className="sticky top-0 z-20 bg-black/30 border-b border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-[#60caba] to-[#FFD700] p-3 rounded-2xl shadow-lg">
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#60caba] to-[#FFD700]">
                        {title}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">Gestiona tu producto con facilidad</p>
                    </div>
                  </div>
                  {showCloseButton && (
                    <button onClick={onClose} className="group bg-white/5 hover:bg-red-500/20 p-3 rounded-2xl transition-all duration-200 border border-white/10 hover:border-red-500/30 transform hover:scale-105" title="Cerrar modal">
                      <svg className="w-6 h-6 text-gray-400 group-hover:text-red-300 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#60caba] to-[#FFD700] opacity-50"></div>
              </div>
              
              {/* Contenido (Children) */}
              <div className="relative max-h-[calc(100vh-220px)] overflow-y-auto">
                <div className="p-6 sm:p-8 text-gray-200">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const modalRoot = document.getElementById('modal-root');
  return modalRoot ? ReactDOM.createPortal(modalContent, modalRoot) : null;
};

export default Modal;