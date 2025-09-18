// src/components/common/TopBanner.tsx
import React from 'react';

const TopBanner: React.FC = () => {
  return (
    <div
      className="w-full text-center text-sm font-semibold text-black"
      style={{
        background: 'linear-gradient(to right, #60caba, #FFD700)',
      }}
    >
      <div className="py-2 px-4">
        <p>
          <span className="font-bold">ENVÍO GRATIS</span>, por compras iguales o superiores a <span className="font-bold">$100.000</span> - Aplica T&C
        </p>
      </div>
    </div>
  );
};

export default TopBanner;