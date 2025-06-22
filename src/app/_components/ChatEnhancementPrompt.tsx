"use client";

import { useState, useEffect } from "react";

interface ExtensionStatus {
  detected: boolean;
  method?: string;
}

export function ChatEnhancementPrompt() {
  const [detectedExtensions, setDetectedExtensions] = useState({
    seventv: { detected: false } as ExtensionStatus,
    bttv: { detected: false } as ExtensionStatus,
    ffz: { detected: false } as ExtensionStatus,
  });
  
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Detection functions for each extension
  const detect7TV = (): ExtensionStatus => {
    if (typeof window === 'undefined') return { detected: false };

    // Check for 7TV global variables
    if ((window as any).SevenTV || (window as any).seventv) {
      console.log('7TV detected');
      return { detected: true, method: 'global-variable' };
    }

    // Check for 7TV DOM elements
    const elements = document.querySelectorAll('[data-seventv], [class*="seventv"], [id*="seventv"]');
    if (elements.length > 0) {
      console.log('7TV detected');
      return { detected: true, method: 'dom-elements' };
    }

    // Check localStorage for 7TV data
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('7tv') || key.includes('seventv'))) {
          console.log('7TV detected');
          return { detected: true, method: 'localStorage' };
        }
      }
    } catch (e) {
      // Silent fail
    }

    console.log('No 7TV extension detected');
    return { detected: false };
  };

  const detectBTTV = (): ExtensionStatus => {
    if (typeof window === 'undefined') return { detected: false };

    // Check for BTTV global variables
    if ((window as any).BTTV || (window as any).BetterTTV) {
      console.log('BTTV detected');
      return { detected: true, method: 'global-variable' };
    }

    // Check for BTTV DOM elements
    const elements = document.querySelectorAll('[data-bttv], [class*="bttv"], .bttv-emote, [data-provider="bttv"]');
    if (elements.length > 0) {
      console.log('BTTV detected');
      return { detected: true, method: 'dom-elements' };
    }

    // Check for BTTV scripts
    const scripts = Array.from(document.querySelectorAll('script'));
    if (scripts.some(script => script.src?.includes('betterttv') || script.innerHTML.includes('BTTV'))) {
      console.log('BTTV detected');
      return { detected: true, method: 'injected-script' };
    }

    return { detected: false };
  };

  const detectFFZ = (): ExtensionStatus => {
    if (typeof window === 'undefined') return { detected: false };

    // Check for FFZ global variables
    if ((window as any).FrankerFaceZ || (window as any).ffz) {
      console.log('FFZ detected');
      return { detected: true, method: 'global-variable' };
    }

    // Check for FFZ DOM elements
    const elements = document.querySelectorAll('[data-ffz], [class*="ffz"], .ffz-emote, [data-provider="ffz"]');
    if (elements.length > 0) {
      console.log('FFZ detected');
      return { detected: true, method: 'dom-elements' };
    }

    // Check for FFZ-specific attributes
    const body = document.body;
    if (body && body.hasAttribute('data-ffz-version')) {
      console.log('FFZ detected');
      return { detected: true, method: 'html-attributes' };
    }

    console.log('No FFZ extension detected');
    return { detected: false };
  };

  // Perform detection once on mount
  useEffect(() => {
    // Single detection after a short delay to let the page load
    const timeout = setTimeout(() => {
      const newExtensions = {
        seventv: detect7TV(),
        bttv: detectBTTV(),
        ffz: detectFFZ(),
      };

      setDetectedExtensions(newExtensions);

      // Show prompt if no extensions are detected
      const anyDetected = Object.values(newExtensions).some(ext => ext.detected);
      if (!anyDetected) {
        setIsVisible(true);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, []); // Empty dependency array - only run once on mount

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  const extensions = [
    { name: '7TV', url: 'https://7tv.app/', color: 'purple' },
    { name: 'BTTV', url: 'https://betterttv.com/', color: 'green' },
    { name: 'FFZ', url: 'https://www.frankerfacez.com/', color: 'blue' }
  ];

  const handleInstall = (url: string) => {
    window.open(url, '_blank');
  };

  // Don't render if any extension is detected or prompt is dismissed
  const anyDetected = Object.values(detectedExtensions).some(ext => ext.detected);
  if (anyDetected || isDismissed || !isVisible) {
    return null;
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'purple': return 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 shadow-purple-500/25';
      case 'green': return 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 shadow-emerald-500/25';
      case 'blue': return 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-blue-500/25';
      default: return 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 shadow-slate-500/25';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500 z-50">
      <div className="bg-slate-900/90 backdrop-blur-xl border-2 border-purple-400/30 rounded-2xl shadow-2xl shadow-purple-400/10 overflow-hidden transform rotate-1">
        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-r from-purple-500/5 to-violet-500/5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative transform -rotate-12">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 via-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 transform rotate-12">
                  <span className="text-2xl">🎭</span>
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Custom Emotes?</h3>
                <p className="text-purple-200 text-sm font-medium">See what the streamers see</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/40 hover:text-white/80 transition-colors p-2 rounded-full hover:bg-white/10 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-6 pb-6">
          {/* Big Emotes Section */}
          <div className="mb-6 text-center">
            <div className="flex justify-center items-center gap-4 my-3">
              <img 
                    className="w-24 h-12 rounded-lg hover:scale-110 hover:rotate-12 transition-all duration-300 shadow-lg cursor-pointer" 
                    alt="Custom emote" 
                    src="https://cdn.betterttv.net/emote/66ca79cec4d9610a574ba395/3x.webp" 
              />
                <img 
                    className="w-15 h-12 rounded-lg hover:scale-110 hover:-rotate-12 transition-all duration-300 shadow-lg cursor-pointer" 
                    alt="Custom emote" 
                    src="https://cdn.betterttv.net/emote/675f215c3cecd93633bbeefe/3x.webp" 
                />
                <img 
                    className="w-20 h-12 rounded-lg hover:scale-110 hover:-rotate-12 transition-all duration-300 shadow-lg cursor-pointer" 
                    alt="Custom emote" 
                    src="https://cdn.betterttv.net/emote/64679e1437a906f91ded3b0f/3x.webp" 
                />
            </div>
                
            <p className="text-white/90 text-sm leading-relaxed mb-2">
              Install an extension to see emotes like these in chat
            </p>
            <p className="text-yellow-300/80 text-xs italic">
              Or don't, we're not getting paid by them 🤷‍♀️
            </p>
          </div>
          
          {/* Extension Options */}
          <div className="space-y-3 mb-5">
            {extensions.map((ext, index) => (
              <button
                key={ext.name}
                onClick={() => handleInstall(ext.url)}
                className={`group w-full px-4 py-3 rounded-xl text-white text-sm font-bold transition-all duration-300 hover:scale-[1.03] hover:shadow-lg transform-gpu cursor-pointer hover:-rotate-1 ${getColorClasses(ext.color)}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>{ext.name}</span>
                    <span className="text-xs opacity-70">✨</span>
                  </span>
                  <svg className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-rotate-12 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
          
          {/* Dismiss Button */}
          <div className="flex justify-center">
            <button
              onClick={handleDismiss}
              className="w-fit px-6 py-3 text-white/60 hover:text-white/90 text-sm font-medium transition-all duration-200 hover:bg-white/5 rounded-lg cursor-pointer hover:scale-[1.01]"
            >
              Nah, I'm good 👋
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 