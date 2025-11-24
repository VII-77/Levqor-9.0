import type { Config } from "tailwindcss";
import { designTokens } from "./src/config/design-tokens";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Levqor Brand Colors (MEGA-PHASE 1)
        primary: designTokens.colors.primary,
        secondary: designTokens.colors.secondary,
        neutral: designTokens.colors.neutral,
        success: designTokens.colors.success,
        warning: designTokens.colors.warning,
        error: designTokens.colors.error,
      },
      fontFamily: designTokens.typography.fontFamily,
      fontSize: designTokens.typography.fontSize,
      fontWeight: designTokens.typography.fontWeight,
      spacing: designTokens.spacing,
      borderRadius: designTokens.borderRadius,
      boxShadow: designTokens.boxShadow,
      transitionDuration: designTokens.transitionDuration,
      transitionTimingFunction: designTokens.transitionTimingFunction,
      zIndex: designTokens.zIndex,
    },
  },
  plugins: [],
};
export default config;
