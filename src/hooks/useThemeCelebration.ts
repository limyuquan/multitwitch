"use client";

import { useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import type { ThemeMatchResult, StreamGroupTheme } from "~/types/stream-groups";

interface ThemeCelebrationOptions {
  duration?: number;
  particleCount?: number;
  spread?: number;
  disableForReducedMotion?: boolean;
}

interface IconParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export function useThemeCelebration(
  themeMatch: ThemeMatchResult,
  options: ThemeCelebrationOptions = {}
) {
  const {
    duration = 3000,
    particleCount = 150,
    spread = 60,
    disableForReducedMotion = true
  } = options;

  const lastActiveThemeRef = useRef<string | null>(null);
  const isInitialRender = useRef(true);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<IconParticle[]>([]);

  // Check if user prefers reduced motion
  const prefersReducedMotion = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Preload theme icon image for confetti
  const preloadThemeIcon = useCallback(async (theme: StreamGroupTheme): Promise<HTMLImageElement | null> => {
    if (!theme.customIcon) return null;

    // Check cache first
    const cacheKey = theme.customIcon;
    if (imageCache.current.has(cacheKey)) {
      return imageCache.current.get(cacheKey)!;
    }

    try {
      const img = await new Promise<HTMLImageElement | null>((resolve) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        
        image.onload = () => {
          resolve(image);
        };

        image.onerror = () => {
          console.warn('Failed to load theme icon for confetti:', theme.customIcon);
          resolve(null);
        };

        image.src = theme.customIcon!;
      });

      // Cache the image for future use
      if (img) {
        imageCache.current.set(cacheKey, img);
      }

      return img;
    } catch (error) {
      console.warn('Error loading theme icon:', error);
      return null;
    }
  }, []);

  // Create and animate custom icon particles
  const createIconConfetti = useCallback((themeIcon: HTMLImageElement, colors: string[]) => {
    // Create overlay canvas for icon confetti
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    document.body.appendChild(canvas);
    canvasRef.current = canvas;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create icon particles with elegant spiral and burst patterns
    const particles: IconParticle[] = [];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight * 0.5; // More centered for better visual balance
    
    // Golden ratio for aesthetically pleasing spiral
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees

    // Create elegant particle distributions with natural patterns (optimized)
    const createSpiralBurst = (count: number, offsetX: number, offsetY: number, velocityRange: [number, number]) => {
      for (let i = 0; i < count; i++) {
        const angle = (i * goldenAngle) % (2 * Math.PI);
        const radius = Math.sqrt(i) * 4; // Reduced radius calculation
        const velocity = velocityRange[0] + Math.random() * (velocityRange[1] - velocityRange[0]);
        
        particles.push({
          x: centerX + offsetX + Math.cos(angle) * radius * 0.4,
          y: centerY + offsetY + Math.sin(angle) * radius * 0.3,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - Math.random() * 3,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.04, // Reduced rotation speed
          scale: 0.7 + Math.random() * 0.4, // Reduced scale variation
          alpha: 1,
          life: 0,
          maxLife: 180 + Math.random() * 120 // Shorter life for better performance
        });
      }
    };

    const createRingBurst = (count: number, offsetX: number, offsetY: number, radius: number, velocityRange: [number, number]) => {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.3;
        const velocity = velocityRange[0] + Math.random() * (velocityRange[1] - velocityRange[0]);
        const startRadius = radius + (Math.random() - 0.5) * 20;
        
        particles.push({
          x: centerX + offsetX + Math.cos(angle) * startRadius,
          y: centerY + offsetY + Math.sin(angle) * startRadius * 0.7,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - Math.random() * 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.06,
          scale: 0.6 + Math.random() * 0.5,
          alpha: 1,
          life: 0,
          maxLife: 200 + Math.random() * 100
        });
      }
    };

    const createCascade = (count: number, offsetX: number, offsetY: number, angleRange: [number, number], velocityRange: [number, number]) => {
      for (let i = 0; i < count; i++) {
        const angle = angleRange[0] + Math.random() * (angleRange[1] - angleRange[0]);
        const velocity = velocityRange[0] + Math.random() * (velocityRange[1] - velocityRange[0]);
        
        particles.push({
          x: centerX + offsetX + (Math.random() - 0.5) * 50,
          y: centerY + offsetY + (Math.random() - 0.5) * 25,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - Math.random() * 3,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.08,
          scale: 0.5 + Math.random() * 0.6,
          alpha: 1,
          life: 0,
          maxLife: 160 + Math.random() * 80
        });
      }
    };

    // Ultra-optimized particle creation - minimal counts for smooth performance
    createSpiralBurst(15, 0, 0, [8, 12]); // Further reduced from 25
    createRingBurst(12, 0, -20, 40, [6, 10]); // Further reduced from 18
    createCascade(8, -100, 15, [Math.PI * 0.3, Math.PI * 0.7], [7, 11]); // Further reduced from 12
    createCascade(8, 100, 15, [Math.PI * 0.3, Math.PI * 0.7], [7, 11]); // Further reduced from 12
    createSpiralBurst(6, 0, -40, [4, 7]); // Further reduced from 10
    createRingBurst(6, 0, 25, 50, [5, 8]); // Further reduced from 8

    particlesRef.current = particles;

    // Ultra-optimized animation loop - maximum performance
    let frameCount = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let activeParticles = 0;
      frameCount++;
      
      // Skip heavy calculations on some frames for better performance
      const skipFrame = frameCount % 2 === 0;
      
      particles.forEach((particle) => {
        if (particle.life < particle.maxLife) {
          activeParticles++;
          
          // Ultra-simplified physics
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vy += 0.4; // Gravity
          particle.vx *= 0.996; // Air resistance
          
          // Only update rotation every other frame
          if (!skipFrame) {
            particle.rotation += particle.rotationSpeed;
          }
          
          particle.life++;
          
          // Simple linear fade
          const lifeProgress = particle.life / particle.maxLife;
          particle.alpha = lifeProgress > 0.6 ? 1 - ((lifeProgress - 0.6) / 0.4) : 1;
          
          // Minimal drawing operations
          if (particle.alpha > 0.1) { // Skip nearly invisible particles
            ctx.globalAlpha = particle.alpha;
            ctx.save();
            ctx.translate(particle.x, particle.y);
            if (!skipFrame) { // Only rotate every other frame
              ctx.rotate(particle.rotation);
            }
            ctx.drawImage(themeIcon, -10, -10, 20, 20); // Fixed size for performance
            ctx.restore();
          }
        }
      });
      
      if (activeParticles > 0) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Clean up
        if (canvas.parentNode) {
          document.body.removeChild(canvas);
        }
        canvasRef.current = null;
        particlesRef.current = [];
      }
    };

    animate();
  }, []);

  // Launch theme celebration with theme icon confetti
  const launchCelebration = useCallback(async (theme: StreamGroupTheme) => {
    if (disableForReducedMotion && prefersReducedMotion()) {
      return;
    }

    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.accent,
      '#ffffff',
      '#ffd700'
    ];

    // Ultra-minimal traditional confetti for performance
    const celebrations = [
      // Center sparkle burst (reduced)
      {
        particleCount: Math.floor(particleCount * 0.04), // Halved
        angle: 90,
        spread: 45,
        origin: { x: 0.5, y: 0.5 },
        colors: [theme.colors.accent, '#ffffff'],
        startVelocity: 30,
        scalar: 0.6,
        drift: 0,
        gravity: 1.0,
        ticks: 120, // Shorter duration
        disableForReducedMotion
      },
      // Minimal side sparkles
      {
        particleCount: Math.floor(particleCount * 0.03), // Halved
        angle: 90,
        spread: 60,
        origin: { x: 0.5, y: 0.6 },
        colors: [theme.colors.primary, '#ffffff'],
        startVelocity: 20,
        scalar: 0.4,
        drift: 0,
        gravity: 0.8,
        ticks: 100,
        disableForReducedMotion
      }
    ];

    // Launch traditional confetti bursts
    celebrations.forEach((celebration, index) => {
      setTimeout(() => {
        confetti(celebration);
      }, index * 100);
    });

    // Launch custom icon confetti
    const themeIcon = await preloadThemeIcon(theme);
    if (themeIcon) {
      setTimeout(() => {
        createIconConfetti(themeIcon, colors);
      }, 200);
    }

         // Minimal finishing sparkle effect
     setTimeout(() => {
       confetti({
         particleCount: 6, // Halved
         angle: 90,
         spread: 80, // Reduced spread
         origin: { x: 0.5, y: 0.4 },
         colors: [theme.colors.accent, '#ffffff'],
         startVelocity: 15, // Reduced velocity
         scalar: 0.3, // Smaller particles
         gravity: 0.8,
         ticks: 60, // Much shorter duration
         disableForReducedMotion
       });
     }, 600); // Earlier timing

    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  }, [disableForReducedMotion, prefersReducedMotion, particleCount, spread, preloadThemeIcon, createIconConfetti]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (canvasRef.current) {
      document.body.removeChild(canvasRef.current);
      canvasRef.current = null;
    }
    particlesRef.current = [];
  }, []);

  // Effect to detect theme changes and trigger celebrations
  useEffect(() => {
    // Skip celebration on initial render to avoid celebration when page loads
    if (isInitialRender.current) {
      isInitialRender.current = false;
      lastActiveThemeRef.current = themeMatch.matched ? themeMatch.theme.name : null;
      return;
    }

    // Check if theme became active (went from no theme or different theme to active theme)
    const currentTheme = themeMatch.matched ? themeMatch.theme.name : null;
    const lastTheme = lastActiveThemeRef.current;

    if (currentTheme && currentTheme !== lastTheme) {
      // Theme activated or changed - trigger celebration!
      launchCelebration(themeMatch.theme);
    }

    lastActiveThemeRef.current = currentTheme;
  }, [themeMatch, launchCelebration]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Manual trigger function for testing or special occasions
  const triggerCelebration = useCallback(() => {
    if (themeMatch.matched) {
      launchCelebration(themeMatch.theme);
    }
  }, [themeMatch, launchCelebration]);

  return {
    triggerCelebration,
    isThemeActive: themeMatch.matched,
    currentTheme: themeMatch.matched ? themeMatch.theme : null
  };
} 