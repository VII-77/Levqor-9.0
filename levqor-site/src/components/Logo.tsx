/**
 * Levqor Logo Component (MEGA-PHASE 1 - STEP 2)
 * 
 * Professional SVG logo with brand colors
 * Supports both full logo and icon-only variants
 * 
 * SAFETY: Pure visual component, no business logic
 */

import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ variant = 'full', className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  };

  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses[size]} w-auto ${className}`}
        aria-label="Levqor"
      >
        {/* Icon: Abstract automation symbol - flowing data paths */}
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        
        {/* Outer circle */}
        <circle cx="20" cy="20" r="18" fill="url(#logo-gradient)" opacity="0.1" />
        
        {/* L-shaped automation path */}
        <path
          d="M12 10 L12 22 L22 22 L22 30"
          stroke="url(#logo-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Flow nodes */}
        <circle cx="12" cy="10" r="3" fill="#3b82f6" />
        <circle cx="12" cy="22" r="2.5" fill="#3b82f6" opacity="0.8" />
        <circle cx="22" cy="22" r="2.5" fill="#a855f7" opacity="0.8" />
        <circle cx="22" cy="30" r="3" fill="#a855f7" />
        
        {/* Success indicator */}
        <path
          d="M26 12 L28 14 L32 10"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={sizeClasses[size]}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logo-gradient-full" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        
        <circle cx="20" cy="20" r="18" fill="url(#logo-gradient-full)" opacity="0.1" />
        
        <path
          d="M12 10 L12 22 L22 22 L22 30"
          stroke="url(#logo-gradient-full)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        <circle cx="12" cy="10" r="3" fill="#3b82f6" />
        <circle cx="12" cy="22" r="2.5" fill="#3b82f6" opacity="0.8" />
        <circle cx="22" cy="22" r="2.5" fill="#a855f7" opacity="0.8" />
        <circle cx="22" cy="30" r="3" fill="#a855f7" />
        
        <path
          d="M26 12 L28 14 L32 10"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      
      {/* Wordmark */}
      <span 
        className={`font-bold text-neutral-900 ${
          size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl'
        }`}
      >
        Levqor
      </span>
    </div>
  );
}
