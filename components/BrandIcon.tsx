
import React from 'react';

interface BrandIconProps {
  className?: string;
}

const BrandIcon: React.FC<BrandIconProps> = ({ 
  className = "w-8 h-8"
}) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <mask id="ghost-mask">
          <rect width="100" height="100" fill="white" />
          <circle cx="38" cy="48" r="8" fill="black" />
          <circle cx="62" cy="48" r="8" fill="black" />
        </mask>
      </defs>
      
      {/* Background Red for Eyes */}
      <circle cx="38" cy="48" r="8" fill="#660000" style={{ fill: 'var(--color-red)' }} />
      <circle cx="62" cy="48" r="8" fill="#660000" style={{ fill: 'var(--color-red)' }} />

      {/* Ghost Body with Masked Eyes - Added additional curve at bottom */}
      <path
        d="M20 45C20 28.4315 33.4315 15 50 15C66.5685 15 80 28.4315 80 45V75C80 85 70 85 65 75C60 65 55 65 50 75C45 85 40 85 35 75C30 65 25 65 20 75V45Z"
        fill="white"
        mask="url(#ghost-mask)"
      />
    </svg>
  );
};

export default BrandIcon;
