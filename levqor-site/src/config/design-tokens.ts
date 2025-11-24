/**
 * Levqor Design Tokens (MEGA-PHASE 1)
 * 
 * Central design system tokens for consistent branding across the platform.
 * These tokens are CSS custom properties that can be used throughout the app.
 * 
 * SAFETY: This file only defines design values. It does NOT modify:
 * - Pricing (£9/£29/£59/£149)
 * - Trial logic (7-day, card required)
 * - SLAs (48h/24h/12h/4h)
 * - Legal copy
 * - DFY prices (£149/£299/£499)
 */

export const designTokens = {
  // Brand Colors
  colors: {
    // Primary Brand (Levqor Blue)
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',  // Main brand blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    
    // Secondary (Purple accent for AI features)
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
      950: '#3b0764',
    },
    
    // Neutrals (Slate scale for dark theme)
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    
    // Success (Green for confirmations)
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    // Warning (Amber for caution states)
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    // Error (Red for errors)
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'] as string[],
      mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'] as string[],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }] as [string, { lineHeight: string }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }] as [string, { lineHeight: string }],
      base: ['1rem', { lineHeight: '1.5rem' }] as [string, { lineHeight: string }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }] as [string, { lineHeight: string }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }] as [string, { lineHeight: string }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }] as [string, { lineHeight: string }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }] as [string, { lineHeight: string }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }] as [string, { lineHeight: string }],
      '5xl': ['3rem', { lineHeight: '1' }] as [string, { lineHeight: string }],
      '6xl': ['3.75rem', { lineHeight: '1' }] as [string, { lineHeight: string }],
      '7xl': ['4.5rem', { lineHeight: '1' }] as [string, { lineHeight: string }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },
  
  // Spacing Scale
  spacing: {
    0: '0px',
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    8: '2rem',       // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    32: '8rem',      // 128px
  },
  
  // Border Radius
  borderRadius: {
    none: '0px',
    sm: '0.125rem',   // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },
  
  // Transitions
  transitionDuration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  
  transitionTimingFunction: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Z-Index Layers
  zIndex: {
    base: '0',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modalBackdrop: '1040',
    modal: '1050',
    popover: '1060',
    tooltip: '1070',
  },
};

export type DesignTokens = typeof designTokens;
