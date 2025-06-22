import confetti from "canvas-confetti";

/**
 * Utility functions for managing confetti celebrations
 */

/**
 * Stop all active confetti animations
 */
export function stopAllConfetti() {
  confetti.reset();
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Launch a simple confetti burst with theme colors
 */
export function launchSimpleConfetti(colors: string[], options: Partial<confetti.Options> = {}) {
  if (prefersReducedMotion()) return;
  
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors,
    ...options
  });
}

/**
 * Launch confetti from multiple directions
 */
export function launchMultiDirectionalConfetti(colors: string[], intensity: 'low' | 'medium' | 'high' = 'medium') {
  if (prefersReducedMotion()) return;

  const intensitySettings = {
    low: { count: 50, spread: 50, velocity: 30 },
    medium: { count: 100, spread: 70, velocity: 45 },
    high: { count: 150, spread: 90, velocity: 60 }
  };

  const settings = intensitySettings[intensity];

  // Left side
  confetti({
    particleCount: settings.count * 0.3,
    angle: 60,
    spread: settings.spread * 0.8,
    origin: { x: 0.1, y: 0.7 },
    colors,
    startVelocity: settings.velocity
  });

  // Center
  confetti({
    particleCount: settings.count * 0.4,
    angle: 90,
    spread: settings.spread,
    origin: { x: 0.5, y: 0.6 },
    colors,
    startVelocity: settings.velocity
  });

  // Right side
  confetti({
    particleCount: settings.count * 0.3,
    angle: 120,
    spread: settings.spread * 0.8,
    origin: { x: 0.9, y: 0.7 },
    colors,
    startVelocity: settings.velocity
  });
}

/**
 * Launch a themed celebration with emoji confetti
 */
export function launchEmojiConfetti(emoji: string, colors: string[], options: Partial<confetti.Options> = {}) {
  if (prefersReducedMotion()) return;

  try {
    const emojiShape = confetti.shapeFromText({ 
      text: emoji, 
      scalar: 1.2 
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors,
      shapes: [emojiShape],
      scalar: 1.2,
      ...options
    });
  } catch (error) {
    console.warn('Failed to create emoji confetti, falling back to default:', error);
    launchSimpleConfetti(colors, options);
  }
}

/**
 * Launch a continuous celebration effect
 */
export function launchContinuousConfetti(
  colors: string[], 
  duration = 3000, 
  interval = 300
): () => void {
  if (prefersReducedMotion()) return () => {};

  const intervalId = setInterval(() => {
    confetti({
      particleCount: 30,
      angle: 60 + Math.random() * 60,
      spread: 40,
      origin: { 
        x: Math.random(),
        y: 0.6 + Math.random() * 0.3 
      },
      colors,
      startVelocity: 30 + Math.random() * 20
    });
  }, interval);

  // Auto-stop after duration
  setTimeout(() => {
    clearInterval(intervalId);
  }, duration);

  // Return stop function
  return () => {
    clearInterval(intervalId);
  };
} 