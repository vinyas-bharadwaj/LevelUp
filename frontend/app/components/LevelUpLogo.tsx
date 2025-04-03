import React from 'react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const LevelUpLogo: React.FC<LogoProps> = ({ 
  className = "", 
  width = 32, 
  height = 32 
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      className={className}
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Book cover base */}
      <path 
        d="M12 6L3 2v16l9 4 9-4V2l-9 4z" 
        stroke="#2C3E50" 
        fill="#F7F9FC"
      />
      
      {/* Left side of open book */}
      <path 
        d="M3 2l9 4" 
        stroke="#2C3E50" 
        strokeWidth="1.5"
      />
      
      {/* Right side of open book */}
      <path 
        d="M12 6l9-4" 
        stroke="#2C3E50" 
        strokeWidth="1.5"
      />
      
      {/* Page being turned (curving effect) */}
      <path 
        d="M7.5 11C9 10.5 10.5 10 12 10s2.5 0.5 4 1c0 0.5 0 1 0 1.5c-1.5-0.5-3-1-4.5-1s-3 0.5-4 1z" 
        fill="#ffffff"
        stroke="#7F8C8D"
        strokeWidth="0.75"
      />
      
      {/* Pages being flipped - top page */}
      <path 
        d="M12 10c-1.5 0-3 0.5-4.5 1C6 7.5 9 6.5 12 6" 
        fill="#ffffff" 
        stroke="#7F8C8D"
        strokeWidth="1"
      />
      
      {/* Pages being flipped - middle page */}
      <path 
        d="M12 8c-1.5 0.5-3 1-4 1.5C6.5 6 9.5 5 12 4.5" 
        fill="#ffffff" 
        stroke="#7F8C8D"
        strokeWidth="0.75"
        opacity="0.8"
      />
      
      {/* Page lines to show text */}
      <line 
        x1="5" 
        y1="14" 
        x2="8" 
        y2="13" 
        stroke="#6A7A8C" 
        strokeWidth="0.5" 
      />
      <line 
        x1="5" 
        y1="15" 
        x2="7.5" 
        y2="14.25" 
        stroke="#6A7A8C" 
        strokeWidth="0.5" 
      />
      
      {/* Progress arrow on right page */}
      <path 
        d="M16 11.5l0 3.5" 
        stroke="#505A64" 
        strokeWidth="1.5" 
      />
      <path 
        d="M14.5 13.5L16 11.5L17.5 13.5" 
        stroke="#505A64" 
        strokeWidth="1.5" 
      />
    </svg>
  );
};

export default LevelUpLogo;