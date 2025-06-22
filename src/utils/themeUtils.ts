import type { StreamGroupTheme } from "~/types/stream-groups";

/**
 * Utility functions for working with themes in components
 */

/**
 * Get theme-aware CSS custom properties as a style object
 */
export function getThemeStyles(theme: StreamGroupTheme) {
  return {
    '--theme-primary': theme.colors.primary,
    '--theme-secondary': theme.colors.secondary,
    '--theme-accent': theme.colors.accent,
    '--theme-background': theme.colors.background.includes('from-') 
      ? convertTailwindGradientToCSS(theme.colors.background)
      : theme.colors.background,
  } as React.CSSProperties;
}

/**
 * Generate theme-aware button classes
 */
export function getThemeButtonClass(variant: 'primary' | 'secondary' | 'ghost' = 'primary') {
  const baseClasses = "transition-all duration-300 font-medium rounded-lg";
  
  switch (variant) {
    case 'primary':
      return `${baseClasses} btn-theme text-white shadow-lg hover:scale-105`;
    case 'secondary':
      return `${baseClasses} border-2 border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white`;
    case 'ghost':
      return `${baseClasses} text-theme-primary hover:bg-theme-primary/10`;
    default:
      return `${baseClasses} btn-theme`;
  }
}

/**
 * Get theme-aware background class
 */
export function getThemeBackgroundClass(opacity: number = 100) {
  if (opacity === 100) {
    return "bg-theme-gradient";
  }
  return "bg-theme-gradient"; // For now, opacity handling would need more complex CSS
}

/**
 * Get theme-aware text color classes
 */
export function getThemeTextClass(variant: 'primary' | 'secondary' | 'accent' = 'primary') {
  switch (variant) {
    case 'primary':
      return 'text-theme-primary';
    case 'secondary':
      return 'text-theme-secondary';
    case 'accent':
      return 'text-theme-accent';
    default:
      return 'text-theme-primary';
  }
}

/**
 * Get theme-aware border classes
 */
export function getThemeBorderClass(variant: 'primary' | 'secondary' | 'accent' = 'primary') {
  switch (variant) {
    case 'primary':
      return 'border-theme-primary';
    case 'secondary':
      return 'border-theme-secondary';
    case 'accent':
      return 'border-theme-accent';
    default:
      return 'border-theme-primary';
  }
}

/**
 * Helper function to convert Tailwind gradient classes to CSS
 * (Simplified version for utility use)
 */
function convertTailwindGradientToCSS(gradientClass: string): string {
  // Color mapping for common Tailwind colors
  const colorMap: Record<string, string> = {
    'slate-950': '#020617',
    'slate-900': '#0f172a',
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

  // Extract direction
  let direction = 'to bottom right';
  if (gradientClass.includes('gradient-to-r')) direction = 'to right';
  else if (gradientClass.includes('gradient-to-l')) direction = 'to left';
  else if (gradientClass.includes('gradient-to-t')) direction = 'to top';
  else if (gradientClass.includes('gradient-to-b')) direction = 'to bottom';

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