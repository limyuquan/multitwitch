"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import type { StreamGroupTheme } from "~/types/stream-groups";

interface ThemeCelebrationProps {
  theme: StreamGroupTheme;
  onComplete?: () => void;
}

// Create theme-specific celebration patterns
const getThemePattern = (theme: StreamGroupTheme) => {
  const patterns = {
    // OTV & Friends - Heart theme
    'otv-theme': {
      emoji: '💖',
      secondaryEmoji: '✨',
      pattern: 'heart-burst'
    },
    // 100 Thieves - Fire theme
    '100t-theme': {
      emoji: '🔥',
      secondaryEmoji: '⚡',
      pattern: 'fire-explosion'
    },
    // Valorant Pros - Target theme
    'valorant-theme': {
      emoji: '🎯',
      secondaryEmoji: '💥',
      pattern: 'precision-strike'
    },
    // Variety Streamers - Gaming theme
    'variety-theme': {
      emoji: '🎮',
      secondaryEmoji: '🌟',
      pattern: 'gaming-burst'
    },
    // Default fallback
    default: {
      emoji: '🎉',
      secondaryEmoji: '✨',
      pattern: 'celebration'
    }
  };

  return patterns[theme.name as keyof typeof patterns] || patterns.default;
};

export function ThemeCelebration({ theme, onComplete }: ThemeCelebrationProps) {
  useEffect(() => {
    const launchCelebration = async () => {
      const pattern = getThemePattern(theme);
      const colors = [
        theme.colors.primary,
        theme.colors.secondary,
        theme.colors.accent,
        '#ffffff',
        '#ffd700'
      ];

      try {
        // Create emoji shapes for confetti
        const primaryShape = confetti.shapeFromText({ 
          text: pattern.emoji, 
          scalar: 1.5,
          color: theme.colors.primary
        });
        
        const secondaryShape = confetti.shapeFromText({ 
          text: pattern.secondaryEmoji, 
          scalar: 1,
          color: theme.colors.accent
        });

        // Launch celebration sequence based on pattern
        switch (pattern.pattern) {
          case 'heart-burst':
            await launchHeartBurst(colors, primaryShape, secondaryShape);
            break;
          case 'fire-explosion':
            await launchFireExplosion(colors, primaryShape, secondaryShape);
            break;
          case 'precision-strike':
            await launchPrecisionStrike(colors, primaryShape, secondaryShape);
            break;
          case 'gaming-burst':
            await launchGamingBurst(colors, primaryShape, secondaryShape);
            break;
          default:
            await launchDefaultCelebration(colors, primaryShape, secondaryShape);
        }
      } catch (error) {
        console.warn('Failed to create custom shapes, using default celebration:', error);
        await launchDefaultCelebration(colors);
      }

      onComplete?.();
    };

    launchCelebration();
  }, [theme, onComplete]);

  return null; // This component doesn't render anything visible
}

// Heart burst pattern for OTV & Friends
async function launchHeartBurst(colors: string[], primaryShape?: confetti.Shape, secondaryShape?: confetti.Shape) {
  const shapes = primaryShape && secondaryShape ? [primaryShape, secondaryShape] : undefined;
  
  // Central heart explosion
  confetti({
    particleCount: 50,
    angle: 90,
    spread: 45,
    origin: { x: 0.5, y: 0.6 },
    colors,
    shapes,
    startVelocity: 45,
    scalar: 1.2,
    gravity: 1,
    ticks: 200
  });

  // Side hearts
  setTimeout(() => {
    confetti({
      particleCount: 30,
      angle: 45,
      spread: 55,
      origin: { x: 0.1, y: 0.7 },
      colors,
      shapes,
      startVelocity: 40,
      scalar: 0.8
    });

    confetti({
      particleCount: 30,
      angle: 135,
      spread: 55,
      origin: { x: 0.9, y: 0.7 },
      colors,
      shapes,
      startVelocity: 40,
      scalar: 0.8
    });
  }, 200);
}

// Fire explosion pattern for 100 Thieves
async function launchFireExplosion(colors: string[], primaryShape?: confetti.Shape, secondaryShape?: confetti.Shape) {
  const shapes = primaryShape && secondaryShape ? [primaryShape, secondaryShape] : undefined;
  
  // Intense central explosion
  confetti({
    particleCount: 100,
    angle: 90,
    spread: 180,
    origin: { x: 0.5, y: 0.8 },
    colors,
    shapes,
    startVelocity: 60,
    scalar: 1.5,
    gravity: 1.2,
    ticks: 300
  });

  // Rising flames effect
  setTimeout(() => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        confetti({
          particleCount: 20,
          angle: 90,
          spread: 30,
          origin: { x: 0.3 + i * 0.1, y: 0.9 },
          colors: [colors[0], colors[1], '#ff4500'],
          shapes,
          startVelocity: 50,
          scalar: 0.8,
          gravity: 0.8
        });
      }, i * 100);
    }
  }, 100);
}

// Precision strike pattern for Valorant Pros
async function launchPrecisionStrike(colors: string[], primaryShape?: confetti.Shape, secondaryShape?: confetti.Shape) {
  const shapes = primaryShape && secondaryShape ? [primaryShape, secondaryShape] : undefined;
  
  // Quick precise bursts
  const positions = [
    { x: 0.2, y: 0.3 },
    { x: 0.8, y: 0.3 },
    { x: 0.5, y: 0.1 },
    { x: 0.5, y: 0.7 }
  ];

  positions.forEach((pos, index) => {
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 90,
        spread: 60,
        origin: pos,
        colors,
        shapes,
        startVelocity: 55,
        scalar: 1,
        gravity: 1.3,
        ticks: 180
      });
    }, index * 150);
  });
}

// Gaming burst pattern for Variety Streamers
async function launchGamingBurst(colors: string[], primaryShape?: confetti.Shape, secondaryShape?: confetti.Shape) {
  const shapes = primaryShape && secondaryShape ? [primaryShape, secondaryShape] : undefined;
  
  // Continuous gaming celebration
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      confetti({
        particleCount: 25,
        angle: 60 + Math.random() * 60,
        spread: 50,
        origin: { x: Math.random(), y: 0.6 + Math.random() * 0.3 },
        colors,
        shapes,
        startVelocity: 40 + Math.random() * 20,
        scalar: 0.8 + Math.random() * 0.4,
        gravity: 1 + Math.random() * 0.5
      });
    }, i * 200);
  }
}

// Default celebration pattern
async function launchDefaultCelebration(colors: string[], primaryShape?: confetti.Shape, secondaryShape?: confetti.Shape) {
  const shapes = primaryShape && secondaryShape ? [primaryShape, secondaryShape] : undefined;
  
  confetti({
    particleCount: 100,
    angle: 90,
    spread: 70,
    origin: { x: 0.5, y: 0.6 },
    colors,
    shapes,
    startVelocity: 50,
    scalar: 1,
    gravity: 1,
    ticks: 200
  });
} 