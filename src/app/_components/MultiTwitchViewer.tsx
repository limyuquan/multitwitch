"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { StreamSetup } from "./StreamSetup";
import { VideoGrid } from "./VideoGrid";
import { ChatPanel } from "./ChatPanel";
import { ViewModeToggle } from "./ViewModeToggle";
import { StreamManagerModal } from "./StreamManagerModal";
import { EmptyStreamState } from "./EmptyStreamState";
import { ThemeIcon } from "./ThemeIcon";
import { useStreamGroupTheme } from "~/hooks/useStreamGroupTheme";
import { useThemeCelebration } from "~/hooks/useThemeCelebration";
import { ThemeProvider } from "~/contexts/ThemeContext";

export interface StreamConfig {
  username: string;
  isActive: boolean;
}

export type ViewMode = "split" | "single";

export function MultiTwitchViewer() {
  const [streams, setStreams] = useState<StreamConfig[]>([]);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [activeStreamIndex, setActiveStreamIndex] = useState(0);
  const [activeChatStream, setActiveChatStream] = useState<string>("");
  const [isStreamManagerOpen, setIsStreamManagerOpen] = useState(false);
  const [chatPanelWidth, setChatPanelWidth] = useState(320); // Default 320px (80 * 4)
  const [isMobile, setIsMobile] = useState(false);
  
  // Theme management
  const { themeMatch, isLoading: themeLoading, error: themeError } = useStreamGroupTheme(streams);
  
  // Theme celebration effects
  const { triggerCelebration } = useThemeCelebration(themeMatch, {
    particleCount: 200,
    spread: 70,
    disableForReducedMotion: true
  });
  
  // Header auto-hide state
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Constants for header behavior
  const HIDE_DELAY = 1500; // Hide after 1.5 seconds of inactivity
  const SHOW_ZONE_HEIGHT = 80; // Show header when mouse is within 80px of top

  // Track mouse activity and position
  const handleMouseActivity = useCallback((event: MouseEvent) => {
    const currentTime = Date.now();
    setLastActivity(currentTime);

    // Show header immediately if mouse is near the top
    if (event.clientY <= SHOW_ZONE_HEIGHT) {
      setIsHeaderVisible(true);
    }

    // Clear existing timeout and set new one
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }

    // Always show header on activity
    setIsHeaderVisible(true);

    // Set timeout to hide header after inactivity
    activityTimeoutRef.current = setTimeout(() => {
      // Only hide if mouse is not hovering over header and not in show zone
      if (!isHeaderHovered && event.clientY > SHOW_ZONE_HEIGHT) {
        setIsHeaderVisible(false);
      }
    }, HIDE_DELAY);
  }, [isHeaderHovered]);

  // Handle keyboard activity
  const handleKeyActivity = useCallback(() => {
    setLastActivity(Date.now());
    setIsHeaderVisible(true);

    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }

    activityTimeoutRef.current = setTimeout(() => {
      if (!isHeaderHovered) {
        setIsHeaderVisible(false);
      }
    }, HIDE_DELAY);
  }, [isHeaderHovered]);

  // Setup event listeners for activity tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMouseActivity(e);
    const handleMouseClick = (e: MouseEvent) => handleMouseActivity(e);
    const handleKeyDown = () => handleKeyActivity();
    const handleScroll = () => handleKeyActivity();

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleMouseClick);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('scroll', handleScroll);

    return () => {
      // Cleanup event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleMouseClick);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('scroll', handleScroll);
      
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [handleMouseActivity, handleKeyActivity]);

  // Keep header visible when hovered
  useEffect(() => {
    if (isHeaderHovered) {
      setIsHeaderVisible(true);
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    } else {
      // Start hide timer when not hovered
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      activityTimeoutRef.current = setTimeout(() => {
        setIsHeaderVisible(false);
      }, HIDE_DELAY);
    }
  }, [isHeaderHovered]);

  // Always show header when modals are open
  useEffect(() => {
    if (isStreamManagerOpen) {
      setIsHeaderVisible(true);
    }
  }, [isStreamManagerOpen]);

  // Detect mobile status
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Check on mount
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set initial active chat stream when streams are configured
  useEffect(() => {
    if (streams.length > 0 && !activeChatStream) {
      setActiveChatStream(streams[0]!.username);
    }
  }, [streams, activeChatStream]);

  const handleStreamsSetup = (streamConfigs: StreamConfig[]) => {
    setStreams(streamConfigs);
    setIsSetupComplete(true);
    setActiveStreamIndex(0);
  };

  const handleStreamReorder = (newStreams: StreamConfig[]) => {
    setStreams(newStreams);
    // Update active stream index to maintain the same stream focus after reorder
    const currentActiveStream = streams[activeStreamIndex];
    if (currentActiveStream) {
      const newIndex = newStreams.findIndex(stream => stream.username === currentActiveStream.username);
      if (newIndex !== -1) {
        setActiveStreamIndex(newIndex);
      }
    }
  };

  const handleBackToSetup = () => {
    setIsSetupComplete(false);
    setStreams([]);
    setActiveChatStream("");
    setActiveStreamIndex(0);
  };

  const handleStreamsUpdate = (updatedStreams: StreamConfig[]) => {
    setStreams(updatedStreams);
    
    if (updatedStreams.length === 0) {
      // Keep the interface but show empty state
      setActiveChatStream("");
      setActiveStreamIndex(0);
      return;
    }
    
    // If current active stream is no longer available, switch to first stream
    const currentActiveStream = streams[activeStreamIndex];
    if (!currentActiveStream || !updatedStreams.some(s => s.username === currentActiveStream.username)) {
      setActiveStreamIndex(0);
    }
    
    // Update chat stream if current one is no longer available
    if (!updatedStreams.some(stream => stream.username === activeChatStream)) {
      setActiveChatStream(updatedStreams[0]!.username);
    }
  };

  if (!isSetupComplete) {
    return (
      <ThemeProvider themeMatch={themeMatch} isLoading={themeLoading} error={themeError}>
        <StreamSetup onStreamsSetup={handleStreamsSetup} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider themeMatch={themeMatch} isLoading={themeLoading} error={themeError}>
      <div className="flex h-screen bg-theme-gradient text-white overflow-hidden lg:flex lg:h-screen flex-col lg:flex-row">
      {/* Header */}
      <div 
        className={`absolute top-0 left-0 right-0 z-50 glass-theme backdrop-blur-xl border-b border-slate-700/50 shadow-2xl transition-all duration-500 ${
          isHeaderVisible 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-full opacity-0 shadow-transparent'
        }`}
        style={{
          boxShadow: isHeaderVisible 
            ? `0 25px 50px -12px color-mix(in srgb, var(--theme-primary) 10%, transparent)` 
            : 'none',
          transitionTimingFunction: isHeaderVisible 
            ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' // Spring-like entrance
            : 'cubic-bezier(0.4, 0, 0.2, 1)', // Smooth, controlled exit
          transitionDelay: isHeaderVisible ? '0ms' : '0ms', // No delay for header to feel responsive
        }}
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        <div className="px-3 py-2 lg:px-6 lg:py-1.5">
          {/* Mobile Layout */}
          <div className="lg:hidden">
            {/* Top Row - Main Controls */}
            <div className="flex items-center justify-between mb-2">
              {/* Left - Back to Setup */}
              <button
                onClick={handleBackToSetup}
                className="group flex items-center gap-2 text-slate-400 hover:text-theme-primary transition-all duration-300 hover:-translate-x-1 min-w-0 flex-shrink-0"
              >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-semibold text-base">Setup</span>
              </button>
              
              {/* Right - Manage Streams Button */}
              <button
                onClick={() => setIsStreamManagerOpen(true)}
                className="group flex items-center gap-2 px-4 py-2.5 btn-theme rounded-xl font-medium text-white shadow-lg hover:scale-105 text-base min-h-[44px] flex-shrink-0"
              >
                <svg className="w-4 h-4 transition-transform group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>Manage</span>
              </button>
            </div>
            
            {/* Bottom Row - Branding and Theme */}
            <div className="flex items-center justify-between">
              {/* Left - MultiTwitch Branding */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div 
                  className="relative shadow-lg rounded-lg p-0.5 flex-shrink-0"
                  style={{ 
                    background: `linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))`,
                    boxShadow: `0 10px 20px color-mix(in srgb, var(--theme-primary) 15%, transparent)`
                  }}
                >
                  <ThemeIcon 
                    theme={themeMatch.theme} 
                    size="md"
                    className="shadow-lg"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight leading-none truncate">
                    MultiTwitcher
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse flex-shrink-0"></div>
                    <span className="truncate">{streams.length} stream{streams.length === 1 ? "" : "s"}</span>
                  </div>
                </div>
              </div>

              {/* Right - Theme Group (Compact for Mobile) */}
              {themeMatch.matched && themeMatch.group && (
                <button 
                  onClick={triggerCelebration} 
                  className="flex items-center gap-2 px-3 py-2 rounded-xl glass-theme border border-theme-primary/30 shadow-lg ml-3 flex-shrink-0 min-h-[44px]"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--theme-primary) 8%, transparent)',
                    boxShadow: `0 10px 20px color-mix(in srgb, var(--theme-primary) 20%, transparent)`
                  }}
                >
                  <div 
                    className="relative shadow-lg rounded-lg p-0.5 flex-shrink-0"
                    style={{ 
                      background: `linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))`,
                      boxShadow: `0 8px 16px color-mix(in srgb, var(--theme-primary) 25%, transparent)`
                    }}
                  >
                    <ThemeIcon 
                      theme={themeMatch.theme} 
                      size="sm"
                      className="shadow-lg"
                    />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-sm font-bold text-theme-primary tracking-wide truncate max-w-[80px]">
                      {themeMatch.group.name}
                    </div>
                    <div className="text-xs text-slate-300 font-medium opacity-80">
                      {themeMatch.matchedMembers?.length || 0} matched
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-3 lg:items-center">
            {/* Left Section - Setup + MultiTwitch Branding */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToSetup}
                className="group flex items-center gap-1 text-slate-400 hover:text-theme-primary transition-all duration-300 hover:-translate-x-1"
              >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-semibold cursor-pointer hover:cursor-pointer active:cursor-pointer text-base">Setup</span>
              </button>
              
              <div className="flex items-center gap-3">
                <div 
                  className="relative shadow-lg rounded-lg p-0.5"
                  style={{ 
                    background: `linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))`,
                    boxShadow: `0 10px 20px color-mix(in srgb, var(--theme-primary) 15%, transparent)`
                  }}
                >
                  <ThemeIcon 
                    theme={themeMatch.theme} 
                    size="md"
                    className="shadow-lg"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight leading-none">
                    MultiTwitcher
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                    <span>{streams.length} stream{streams.length === 1 ? "" : "s"} active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Section - Active Theme Group (Most Prominent) */}
            <div className="flex justify-center">
              {themeMatch.matched && themeMatch.group ?(
                <button onClick={triggerCelebration} className="flex items-center gap-4 px-6 py-3 rounded-2xl glass-theme border-2 border-theme-primary/40 shadow-2xl cursor-pointer hover:cursor-pointer active:cursor-pointer"
                     style={{
                       backgroundColor: 'color-mix(in srgb, var(--theme-primary) 8%, transparent)',
                       boxShadow: `0 25px 50px color-mix(in srgb, var(--theme-primary) 30%, transparent)`
                     }}>
                  <div 
                    className="relative shadow-2xl rounded-xl p-1"
                    style={{ 
                      background: `linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))`,
                      boxShadow: `0 15px 30px color-mix(in srgb, var(--theme-primary) 40%, transparent)`
                    }}
                  >
                    <ThemeIcon 
                      theme={themeMatch.theme} 
                      size="lg"
                      className="shadow-xl"
                    />
                    {/* Animated glow effect */}
                    <div 
                      className="absolute inset-0 rounded-xl animate-pulse opacity-30"
                      style={{ 
                        background: `linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))`,
                        filter: 'blur(6px)'
                      }}
                    ></div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-theme-primary tracking-wide">
                      {themeMatch.group.name}
                    </div>
                    <div className="text-sm text-slate-300 font-medium opacity-80">
                      {themeMatch.matchedMembers?.length || 0} matched streamers
                    </div>
                  </div>
                </button>
              ) : (
                <div className="py-7.5">
                </div>
              )}
            </div>
            
            {/* Right Section - Controls */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsStreamManagerOpen(true)}
                className="group flex items-center gap-2 px-4 py-2.5 btn-theme rounded-xl font-medium text-white shadow-lg hover:scale-105 cursor-pointer hover:cursor-pointer active:cursor-pointer text-base"
              >
                <svg className="w-4 h-4 transition-transform group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>Manage Streams</span>
              </button>
              
              {/* Only show view mode toggle on desktop when multiple streams */}
              {streams.length > 1 && (
                <div>
                  <ViewModeToggle
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    streamCount={streams.length}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header Expand Indicator - Only show when header is hidden */}
      <div 
        className={`lg:hidden absolute top-0 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300 ${
          !isHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <button
          onClick={() => setIsHeaderVisible(true)}
          className="flex items-center justify-center px-4 py-2 glass-theme backdrop-blur-xl border border-slate-700/50 rounded-b-xl shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, rgba(15, 23, 42, 0.8))',
            borderTopColor: 'transparent',
            boxShadow: `0 8px 25px color-mix(in srgb, var(--theme-primary) 8%, transparent)`
          }}
          aria-label="Show header controls"
        >
          {/* Chevron down icon to indicate expansion */}
          <svg 
            className="w-4 h-4 text-slate-300 hover:text-theme-primary transition-colors duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          
          {/* Small dots to indicate there are controls */}
          <div className="flex items-center gap-1 ml-2">
            <div className="w-1 h-1 bg-slate-400 rounded-full opacity-60"></div>
            <div className="w-1 h-1 bg-slate-400 rounded-full opacity-60"></div>
            <div className="w-1 h-1 bg-slate-400 rounded-full opacity-60"></div>
          </div>
        </button>
      </div>

      {/* Main Content */}
      <div 
        className={`flex flex-1 flex-col lg:flex-row transition-all duration-500 ${
          isHeaderVisible ? 'pt-20 lg:pt-20' : 'pt-0'
        }`}
        style={{
          transitionTimingFunction: isHeaderVisible 
            ? 'cubic-bezier(0.4, 0, 0.2, 1)' // Smooth entrance, matches header exit
            : 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring-like expansion when header hides
          transitionDelay: isHeaderVisible ? '0ms' : '100ms', // Slight delay for expansion to feel more natural
        }}
      >
        {/* Invisible show zone at top */}
        <div 
          className="absolute top-0 left-0 right-0 z-40 pointer-events-none"
          style={{ height: `${SHOW_ZONE_HEIGHT}px` }}
          onMouseEnter={() => {
            // Show a subtle hint that the header will appear
            setIsHeaderVisible(true);
          }}
        />
        
        {streams.length === 0 ? (
          /* Empty state when no streams */
          <EmptyStreamState
            onManageStreams={() => setIsStreamManagerOpen(true)}
            onBackToSetup={handleBackToSetup}
          />
        ) : (
          <>
            {/* Video Area */}
            <div className="flex-1 min-w-0 relative h-1/2 lg:h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-transparent pointer-events-none z-10 hidden lg:block" />
              <VideoGrid
                streams={streams}
                viewMode={viewMode} // Use viewMode prop but component will override for mobile
                activeStreamIndex={activeStreamIndex}
                onActiveStreamChange={setActiveStreamIndex}
                onStreamReorder={handleStreamReorder}
                onStreamRemove={(stream) => {
                  const updatedStreams = streams.filter(s => s.username !== stream.username);
                  handleStreamsUpdate(updatedStreams);
                }}
                isMobile={isMobile} // Pass mobile prop
              />
            </div>

            {/* Chat Panel */}
            <div className="h-1/2 lg:h-full lg:w-auto">
              <ChatPanel
                streams={streams}
                activeStreamUsername={activeChatStream}
                onStreamChange={setActiveChatStream}
                width={chatPanelWidth}
                onWidthChange={setChatPanelWidth}
                isMobile={isMobile} // Pass mobile prop
              />
            </div>
          </>
        )}
      </div>

      {/* Stream Manager Modal */}
      <StreamManagerModal
        isOpen={isStreamManagerOpen}
        onClose={() => setIsStreamManagerOpen(false)}
        streams={streams}
        onStreamsUpdate={handleStreamsUpdate}
      />
      </div>
    </ThemeProvider>
  );
} 