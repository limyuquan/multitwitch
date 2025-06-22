"use client";

import { createContext, useContext, useEffect } from "react";
import type { StreamGroupTheme, ThemeMatchResult } from "~/types/stream-groups";

interface ThemeContextValue {
  themeMatch: ThemeMatchResult;
  isLoading: boolean;
  error: string | null;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  themeMatch: ThemeMatchResult;
  isLoading: boolean;
  error: string | null;
}

export function ThemeProvider({ children, themeMatch, isLoading, error }: ThemeProviderProps) {
  // Apply CSS custom properties to the document root when theme changes
  useEffect(() => {
    if (!themeMatch.theme) return;

    const root = document.documentElement;
    const theme = themeMatch.theme;

    // Set CSS custom properties for theme colors
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    
    // Parse Tailwind gradient classes to CSS gradients
    const bgClass = theme.colors.background;
    if (bgClass.includes('from-') && bgClass.includes('to-')) {
      // Extract gradient colors from Tailwind classes
      const gradientCSS = convertTailwindGradientToCSS(bgClass);
      root.style.setProperty('--theme-background', gradientCSS);
    } else {
      // Fallback for solid colors
      root.style.setProperty('--theme-background', theme.colors.background);
    }

    // Set additional theme properties
    root.style.setProperty('--theme-name', `"${theme.name}"`);
    
    // Add theme class to body for conditional styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.name}`);

    return () => {
      // Cleanup: remove theme class
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
    };
  }, [themeMatch.theme]);

  return (
    <ThemeContext.Provider value={{ themeMatch, isLoading, error }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper function to convert Tailwind gradient classes to CSS
function convertTailwindGradientToCSS(gradientClass: string): string {
  // This is a simplified conversion - you might want to expand this
  // for more complex gradients
  
  const colorMap: Record<string, string> = {
    'slate-950': '#020617',
    'slate-900': '#0f172a',
    'slate-800': '#1e293b',
    'indigo-950': '#1e1b4b',
    'indigo-900': '#312e81',
    'purple-950': '#581c87',
    'purple-900': '#701a75',
    'violet-950': '#4c1d95',
    'violet-900': '#5b21b6',
    'pink-950': '#831843',
    'pink-900': '#831843',
    'red-950': '#450a0a',
    'red-900': '#7f1d1d',
    'green-950': '#052e16',
    'green-900': '#14532d',
    'cyan-950': '#083344',
    'cyan-900': '#164e63',
    'black': '#000000',
  };

  // Extract direction (default to br - bottom right)
  let direction = 'to bottom right';
  if (gradientClass.includes('gradient-to-r')) direction = 'to right';
  else if (gradientClass.includes('gradient-to-l')) direction = 'to left';
  else if (gradientClass.includes('gradient-to-t')) direction = 'to top';
  else if (gradientClass.includes('gradient-to-b')) direction = 'to bottom';
  else if (gradientClass.includes('gradient-to-tr')) direction = 'to top right';
  else if (gradientClass.includes('gradient-to-tl')) direction = 'to top left';
  else if (gradientClass.includes('gradient-to-bl')) direction = 'to bottom left';

  // Extract colors
  const fromMatch = gradientClass.match(/from-([a-z]+-\d+)/);
  const viaMatch = gradientClass.match(/via-([a-z]+-\d+)/);
  const toMatch = gradientClass.match(/to-([a-z]+-\d+)/);

  const fromColor = fromMatch?.[1] ? colorMap[fromMatch[1]] || fromMatch[1] : '#020617';
  const viaColor = viaMatch?.[1] ? colorMap[viaMatch[1]] || viaMatch[1] : null;
  const toColor = toMatch?.[1] ? colorMap[toMatch[1]] || toMatch[1] : '#312e81';

  if (viaColor) {
    return `linear-gradient(${direction}, ${fromColor}, ${viaColor}, ${toColor})`;
  } else {
    return `linear-gradient(${direction}, ${fromColor}, ${toColor})`;
  }
} 