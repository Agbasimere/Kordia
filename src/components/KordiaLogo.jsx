import React from 'react';

export default function KordiaLogo({ size = 28, light = false, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      {/* Refined Geometric Black & White 'K' Emblem matching sample design */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <rect width="32" height="32" rx="8" fill={light ? "#FFFFFF" : "#0F172A"} />
        {/* Left vertical pillar */}
        <path 
          d="M9 7C9 6.44772 9.44772 6 10 6H12.5C13.0523 6 13.5 6.44772 13.5 7V25C13.5 25.5523 13.0523 26 12.5 26H10C9.44772 26 9 25.5523 9 25V7Z" 
          fill={light ? "#0F172A" : "#FFFFFF"} 
        />
        {/* Top-right branch */}
        <path 
          d="M14 16L19.5 8.2C19.8 7.7 20.4 7.4 21 7.4H22.5C23.3 7.4 23.7 8.4 23.2 9.1L17.5 17.2L14 16Z" 
          fill={light ? "#334155" : "#E2E8F0"} 
        />
        {/* Bottom-right branch */}
        <path 
          d="M16.5 15.2L22.8 24.2C23.3 24.9 22.8 25.8 22 25.8H20.5C19.9 25.8 19.4 25.5 19 25L13.8 17.5L16.5 15.2Z" 
          fill={light ? "#0F172A" : "#FFFFFF"} 
        />
      </svg>

      {showText && (
        <span 
          style={{
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            fontSize: size >= 32 ? '22px' : '19px',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            color: light ? '#FFFFFF' : '#0F172A'
          }}
        >
          Kordia
        </span>
      )}
    </div>
  );
}
