"use client";

import { useState, useEffect } from "react";

interface ExtensionDetectionProps {
  onDismiss?: () => void;
}

interface ExtensionStatus {
  detected: boolean;
  method?: string;
}

export function ExtensionDetection({ onDismiss }: ExtensionDetectionProps) {
  const [sevenTvStatus, setSevenTvStatus] = useState<ExtensionStatus>({ detected: false });
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if user has previously dismissed the prompt
  useEffect(() => {
    const dismissed = localStorage.getItem('7tv-prompt-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  // Multiple detection methods for 7TV
  const detect7TV = (): ExtensionStatus => {
    // Method 1: Check for global 7TV variables
    if (typeof window !== 'undefined') {
      // 7TV often exposes global variables
      if ((window as any).SevenTV || (window as any).seventv) {
        return { detected: true, method: 'global-variable' };
      }

      // Method 2: Check for 7TV DOM elements
      const sevenTvElements = document.querySelectorAll('[data-seventv], [class*="seventv"], [id*="seventv"]');
      if (sevenTvElements.length > 0) {
        return { detected: true, method: 'dom-elements' };
      }

      // Method 3: Check for 7TV specific CSS classes or attributes
      const sevenTvClasses = document.querySelectorAll('.seventv-emote, .seventv-chat-message, [data-seventv-emote]');
      if (sevenTvClasses.length > 0) {
        return { detected: true, method: 'css-classes' };
      }

      // Method 4: Check for extension-injected scripts
      const scripts = Array.from(document.querySelectorAll('script'));
      const sevenTvScript = scripts.find(script => 
        script.src && script.src.includes('seventv') ||
        script.innerHTML.includes('7TV') ||
        script.innerHTML.includes('SevenTV')
      );
      if (sevenTvScript) {
        return { detected: true, method: 'injected-script' };
      }

      // Method 5: Check for postMessage listeners (7TV often uses these)
      try {
        // Send a test message and see if 7TV responds
        const testChannel = new BroadcastChannel('7tv-test');
        testChannel.postMessage({ type: 'ping' });
        testChannel.close();
        
        // Check for 7TV specific message listeners
        if ((window as any).addEventListener) {
          // This is a heuristic check - 7TV extensions typically listen for specific messages
          const messageListeners = (window as any).__messageListeners || [];
          if (messageListeners.some((listener: any) => listener.includes && listener.includes('7tv'))) {
            return { detected: true, method: 'message-listeners' };
          }
        }
      } catch (e) {
        // Silently fail if BroadcastChannel is not supported
      }

      // Method 6: Check localStorage for 7TV data
      try {
        const localStorage = window.localStorage;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('7tv') || key.includes('seventv') || key.includes('SevenTV'))) {
            return { detected: true, method: 'localStorage' };
          }
        }
      } catch (e) {
        // Silently fail if localStorage access is restricted
      }

      // Method 7: Check for extension-specific attributes on body or html
      const body = document.body;
      const html = document.documentElement;
      if ((body && (body.hasAttribute('data-seventv') || body.classList.toString().includes('seventv'))) ||
          (html && (html.hasAttribute('data-seventv') || html.classList.toString().includes('seventv')))) {
        return { detected: true, method: 'html-attributes' };
      }

      // Method 8: Check for emote-related modifications (7TV adds custom emotes)
      const emoteElements = document.querySelectorAll('img[alt*="emote"], img[data-emote], .emote, [data-tooltip*="emote"]');
      for (const element of emoteElements) {
        if (element.getAttribute('src')?.includes('7tv') || 
            element.getAttribute('data-provider') === '7tv' ||
            element.className.includes('7tv')) {
          return { detected: true, method: 'emote-elements' };
        }
      }
    }

    return { detected: false };
  };

  // Perform detection with retry logic
  useEffect(() => {
    if (isDismissed) return;

    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 1000; // 1 second

    const performDetection = () => {
      const status = detect7TV();
      setSevenTvStatus(status);

      if (!status.detected && retryCount < maxRetries) {
        retryCount++;
        setTimeout(performDetection, retryDelay * retryCount);
      } else if (!status.detected) {
        // Show prompt if extension is not detected after all retries
        setIsVisible(true);
      }
    };

    // Initial detection after a short delay to let extensions load
    setTimeout(performDetection, 500);

    // Also listen for DOM changes in case the extension loads later
    const observer = new MutationObserver(() => {
      if (!sevenTvStatus.detected) {
        const status = detect7TV();
        if (status.detected) {
          setSevenTvStatus(status);
          setIsVisible(false);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-seventv', 'data-emote']
    });

    return () => observer.disconnect();
  }, [isDismissed, sevenTvStatus.detected]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('7tv-prompt-dismissed', 'true');
    onDismiss?.();
  };

  const handleInstall = () => {
    // Open 7TV installation page in a new tab
    window.open('https://7tv.app/', '_blank');
  };

  // Don't render if extension is detected or prompt is dismissed
  if (sevenTvStatus.detected || isDismissed || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 border border-purple-500/30 rounded-xl shadow-2xl p-6 z-50 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        {/* 7TV Logo/Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm mb-1">
            Enhance Your Chat Experience
          </h3>
          <p className="text-purple-200 text-xs mb-3 leading-relaxed">
            Install 7TV for custom emotes, improved chat features, and a better streaming experience!
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              Install 7TV
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-purple-300 hover:text-white text-xs font-medium transition-colors duration-200"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-purple-400 hover:text-white transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Small indicator showing what we're detecting */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-purple-300 opacity-75">
          Status: {sevenTvStatus.detected ? `Detected (${sevenTvStatus.method})` : 'Not detected'}
        </div>
      )}
    </div>
  );
} 