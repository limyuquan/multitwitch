"use client";

import { useEffect, useState } from "react";
import { useTheme } from "~/contexts/ThemeContext";

interface ChatDisclaimerProps {
  isVisible: boolean;
  onClose: () => void;
  autoCloseDelay?: number; // in milliseconds
}

export function ChatDisclaimer({ 
  isVisible, 
  onClose, 
  autoCloseDelay = 5000 
}: ChatDisclaimerProps) {
  const { themeMatch } = useTheme();
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      handleClose();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [isVisible, autoCloseDelay]);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsAnimatingOut(false);
      onClose();
    }, 300); // Match animation duration
  };

  if (!isVisible && !isAnimatingOut) return null;

  return (
    <div 
      className={`absolute top-4 left-4 right-4 z-50 transition-all duration-300 ease-out ${
        isVisible && !isAnimatingOut 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 -translate-y-2'
      }`}
    >
      <div 
        className="glass-theme rounded-xl p-4 shadow-2xl border backdrop-blur-md"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--theme-primary) 8%, #1e293b)',
          borderColor: 'color-mix(in srgb, var(--theme-primary) 30%, transparent)',
          boxShadow: `0 20px 25px -5px color-mix(in srgb, var(--theme-primary) 15%, rgba(0, 0, 0, 0.3))`
        }}
      >
        {/* Header with warning icon and close button */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--theme-accent) 15%, transparent)',
                border: '1px solid color-mix(in srgb, var(--theme-accent) 30%, transparent)'
              }}
            >
              <svg 
                className="w-4 h-4"
                style={{ color: 'var(--theme-accent)' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              Chat Etiquette Reminder
            </h4>
          </div>
          
          <button
            onClick={handleClose}
            className="w-6 h-6 rounded-md transition-all duration-200 group flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 20%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Close disclaimer"
          >
            <svg 
              className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Disclaimer text */}
        <div className="space-y-2">
          <p className="text-sm text-slate-200 leading-relaxed">
            <span className="font-semibold text-white">Please be respectful:</span> It is highly recommended that you do not use this feature to chat hop. Depending on streamers' policies, this could result in a ban from their chat.
          </p>
          <p className="text-xs text-slate-400">
            Use stream switching responsibly to enhance your viewing experience.
          </p>
        </div>

        {/* Progress bar showing auto-close timer */}
        <div 
          className="mt-4 h-1 rounded-full overflow-hidden"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--theme-primary) 20%, transparent)'
          }}
        >
          <div 
            className="h-full rounded-full transition-all duration-100 ease-linear"
            style={{
              background: `linear-gradient(to right, var(--theme-primary), var(--theme-secondary))`,
              width: isVisible && !isAnimatingOut ? '0%' : '100%',
              animation: isVisible && !isAnimatingOut ? `shrink-progress ${autoCloseDelay}ms linear` : 'none'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
} 