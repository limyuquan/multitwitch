"use client";

import { useEffect, useState } from "react";

interface ModernToastProps {
  message: string;
  type: "error" | "success" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

export function ModernToast({ message, type, duration = 4000, onClose }: ModernToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    
    // Auto-hide after duration
    const hideTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        onClose?.();
      }, 300); // Wait for exit animation
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case "error":
        return {
          bg: "bg-gradient-to-br from-red-950 to-red-900",
          border: "border-red-800/40",
          iconBg: "bg-red-900/50",
          iconColor: "text-red-300",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6m0-12L6 6" />
            </svg>
          ),
          shadow: "shadow-black/20",
          accent: "bg-red-700"
        };
      case "success":
        return {
          bg: "bg-gradient-to-br from-emerald-950 to-emerald-900",
          border: "border-emerald-800/40",
          iconBg: "bg-emerald-900/50",
          iconColor: "text-emerald-300",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          shadow: "shadow-black/20",
          accent: "bg-emerald-700"
        };
      case "warning":
        return {
          bg: "bg-gradient-to-br from-amber-950 to-amber-900",
          border: "border-amber-800/40",
          iconBg: "bg-amber-900/50",
          iconColor: "text-amber-300",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          shadow: "shadow-black/20",
          accent: "bg-amber-700"
        };
      case "info":
        return {
          bg: "bg-gradient-to-br from-slate-950 to-slate-900",
          border: "border-slate-800/40",
          iconBg: "bg-slate-900/50",
          iconColor: "text-slate-300",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          shadow: "shadow-black/20",
          accent: "bg-slate-700"
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`fixed top-6 right-6 z-[9999] max-w-sm w-full transform transition-all duration-300 ease-out ${
        isVisible && !isLeaving
          ? "translate-x-0 opacity-100 scale-100"
          : isLeaving
          ? "translate-x-full opacity-0 scale-95"
          : "translate-x-full opacity-0 scale-95"
      }`}
    >
      <div
        className={`relative ${styles.bg} ${styles.border} border backdrop-blur-md rounded-lg shadow-2xl ${styles.shadow} overflow-hidden`}
      >
        {/* Subtle accent line */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${styles.accent}`} />
        
        {/* Content */}
        <div className="relative p-4 flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <div className={`w-8 h-8 rounded-md ${styles.iconBg} backdrop-blur-sm flex items-center justify-center border border-white/10`}>
              <div className={styles.iconColor}>
                {styles.icon}
              </div>
            </div>
          </div>
          
          {/* Message */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-gray-100 font-medium text-sm leading-relaxed">
              {message}
            </p>
          </div>
          
          {/* Close button */}
          <button
            onClick={() => {
              setIsLeaving(true);
              setTimeout(() => onClose?.(), 300);
            }}
            className="flex-shrink-0 w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-150 hover:scale-105 group border border-white/10 mt-0.5"
          >
            <svg 
              className="w-3 h-3 text-gray-300 group-hover:text-white transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/20">
          <div 
            className={`h-full ${styles.accent} transform origin-left animate-progress`}
            style={{
              animation: `progress ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}

// Simple toast manager utility - creates DOM elements directly
let toastId = 0;

export function showToast(
  message: string, 
  type: "error" | "success" | "warning" | "info" = "error",
  duration = 4000
): number {
  const id = ++toastId;
  
  // Calculate safe positioning
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isMobile = viewportWidth < 640; // sm breakpoint
  
  // Create toast element with direct positioning
  const toastElement = document.createElement("div");
  toastElement.className = `toast-${id}`;
  
  // Set initial positioning - start off-screen to the right
  toastElement.style.cssText = `
    position: fixed;
    top: 1rem;
    right: -400px;
    z-index: 9999;
    width: ${isMobile ? 'calc(100vw - 2rem)' : '380px'};
    max-width: ${isMobile ? '100%' : '380px'};
    transform: scale(0.95);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: auto;
  `;
  
  // Get type styles
  const getTypeStyles = () => {
    switch (type) {
      case "error":
        return {
          bg: "from-red-950 to-red-900",
          border: "border-red-800/40",
          iconBg: "bg-red-900/50",
          iconColor: "text-red-300",
          icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6m0-12L6 6"></path></svg>`,
          shadow: "shadow-black/20",
          accent: "bg-red-700"
        };
      case "success":
        return {
          bg: "from-emerald-950 to-emerald-900",
          border: "border-emerald-800/40",
          iconBg: "bg-emerald-900/50",
          iconColor: "text-emerald-300",
          icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`,
          shadow: "shadow-black/20",
          accent: "bg-emerald-700"
        };
      case "warning":
        return {
          bg: "from-amber-950 to-amber-900",
          border: "border-amber-800/40",
          iconBg: "bg-amber-900/50",
          iconColor: "text-amber-300",
          icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>`,
          shadow: "shadow-black/20",
          accent: "bg-amber-700"
        };
      case "info":
        return {
          bg: "from-slate-950 to-slate-900",
          border: "border-slate-800/40",
          iconBg: "bg-slate-900/50",
          iconColor: "text-slate-300",
          icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
          shadow: "shadow-black/20",
          accent: "bg-slate-700"
        };
    }
  };
  
  const styles = getTypeStyles();
  
  toastElement.innerHTML = `
    <div class="relative bg-gradient-to-br ${styles.bg} backdrop-blur-md rounded-lg shadow-2xl ${styles.shadow} overflow-hidden border ${styles.border}">
      <!-- Subtle accent line -->
      <div class="absolute top-0 left-0 right-0 h-0.5 ${styles.accent}"></div>
      
      <!-- Content -->
      <div class="relative p-4 flex items-start gap-3">
        <!-- Icon -->
        <div class="flex-shrink-0 mt-0.5">
          <div class="w-8 h-8 rounded-md ${styles.iconBg} backdrop-blur-sm flex items-center justify-center border border-white/10">
            <div class="${styles.iconColor}">
              ${styles.icon}
            </div>
          </div>
        </div>
        
        <!-- Message -->
        <div class="flex-1 min-w-0 pt-0.5">
          <p class="text-gray-100 font-medium text-sm leading-relaxed break-words">
            ${message}
          </p>
        </div>
        
        <!-- Close button -->
        <button class="toast-close flex-shrink-0 w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-150 hover:scale-105 group border border-white/10 mt-0.5">
          <svg class="w-3 h-3 text-gray-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Progress bar -->
      <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-black/20">
        <div class="toast-progress h-full ${styles.accent} transform origin-left" style="animation: progress ${duration}ms linear forwards;"></div>
      </div>
    </div>
  `;
  
  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes progress {
      from { transform: scaleX(1); }
      to { transform: scaleX(0); }
    }
  `;
  document.head.appendChild(style);
  
  // Calculate and adjust positioning for existing toasts
  const existingToasts = document.querySelectorAll('[class*="toast-"]');
  const toastHeight = 80; // Approximate height with margin
  const topOffset = 1 + (existingToasts.length * 5.5); // Stack with spacing
  
  toastElement.style.top = `${topOffset}rem`;
  
  document.body.appendChild(toastElement);
  
  // Close handler
  const closeToast = () => {
    // Animate out to the right
    toastElement.style.right = '-400px';
    toastElement.style.transform = 'scale(0.95)';
    toastElement.style.opacity = '0';
    
    setTimeout(() => {
      if (document.body.contains(toastElement)) {
        document.body.removeChild(toastElement);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
      
      // Reposition remaining toasts
      const remainingToasts = document.querySelectorAll('[class*="toast-"]');
      remainingToasts.forEach((toast, index) => {
        const element = toast as HTMLElement;
        const topOffset = 1 + (index * 5.5);
        element.style.top = `${topOffset}rem`;
      });
    }, 400);
  };
  
  // Add close button listener
  const closeBtn = toastElement.querySelector('.toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeToast);
  }
  
  // Show animation - slide in from right
  setTimeout(() => {
    const safeRightPosition = isMobile ? '1rem' : '1rem';
    toastElement.style.right = safeRightPosition;
    toastElement.style.transform = 'scale(1)';
    toastElement.style.opacity = '1';
  }, 50);
  
  // Auto close
  setTimeout(closeToast, duration);
  
  return id;
}

// Hide a specific toast by ID
export function hideToast(id: number): void {
  const toastElement = document.querySelector(`.toast-${id}`) as HTMLElement;
  if (!toastElement) return;
  
  // Animate out to the right
  toastElement.style.right = '-400px';
  toastElement.style.transform = 'scale(0.95)';
  toastElement.style.opacity = '0';
  
  setTimeout(() => {
    if (document.body.contains(toastElement)) {
      document.body.removeChild(toastElement);
    }
    
    // Reposition remaining toasts
    const remainingToasts = document.querySelectorAll('[class*="toast-"]');
    remainingToasts.forEach((toast, index) => {
      const element = toast as HTMLElement;
      const topOffset = 1 + (index * 5.5);
      element.style.top = `${topOffset}rem`;
    });
  }, 400);
} 