'use client';

import React from 'react';

interface TaleniaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function TaleniaLogo({ size = 'md', showText = true, className = '' }: TaleniaLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 32 32"
          className="w-full h-full"
          fill="currentColor"
        >
          {/* Central circle */}
          <circle cx="16" cy="16" r="2" fill="currentColor" />
          
          {/* Outer circles */}
          <circle cx="16" cy="6" r="1.5" fill="currentColor" />
          <circle cx="22" cy="10" r="1.5" fill="currentColor" />
          <circle cx="26" cy="16" r="1.5" fill="currentColor" />
          <circle cx="22" cy="22" r="1.5" fill="currentColor" />
          <circle cx="16" cy="26" r="1.5" fill="currentColor" />
          <circle cx="10" cy="22" r="1.5" fill="currentColor" />
          <circle cx="6" cy="16" r="1.5" fill="currentColor" />
          
          {/* Star at top-right */}
          <path
            d="M20 8 L22 4 L24 8 L28 8 L25 11 L26 15 L22 13 L18 15 L19 11 L16 8 Z"
            fill="currentColor"
          />
        </svg>
      </div>
      
      {/* Text */}
      {showText && (
        <div>
          <span className={`font-bold text-gray-900 ${textSizeClasses[size]}`}>
            Talenia
          </span>
          {size !== 'sm' && (
            <p className="text-xs text-gray-500">Tu buscador laboral organizado</p>
          )}
        </div>
      )}
    </div>
  );
}
