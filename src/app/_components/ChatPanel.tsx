"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { StreamConfig } from "./MultiTwitchViewer";
import { useTheme } from "~/contexts/ThemeContext";
import { ChatDisclaimer } from "./ChatDisclaimer";
import { api } from "~/trpc/react";

interface ChatPanelProps {
  streams: StreamConfig[];
  activeStreamUsername: string;
  onStreamChange: (username: string) => void;
  width: number;
  onWidthChange: (width: number) => void;
  isMobile?: boolean;
}

// Component to show live/offline status for single stream
interface SingleStreamStatusProps {
  activeStreamUsername: string;
}

function SingleStreamStatus({ activeStreamUsername }: SingleStreamStatusProps) {
  const { data: streamStatus, isLoading } = api.twitch.getStreamStatus.useQuery(
    { username: activeStreamUsername.toLowerCase() },
    {
      enabled: !!activeStreamUsername,
      staleTime: 1 * 60 * 1000, // 1 minute
      gcTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    }
  );

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-between p-4 glass-theme rounded-xl shadow-lg"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--theme-primary) 8%, #1e293b)',
          borderColor: 'color-mix(in srgb, var(--theme-primary) 25%, transparent)'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div 
              className="w-3 h-3 rounded-full shadow-lg bg-gray-500 animate-pulse"
            ></div>
          </div>
          <span className="text-sm font-semibold text-slate-100">{activeStreamUsername}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Checking...</span>
        </div>
      </div>
    );
  }

  if (streamStatus?.isLive) {
    return (
      <div 
        className="flex items-center justify-between p-4 glass-theme rounded-xl shadow-lg"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--theme-primary) 8%, #1e293b)',
          borderColor: 'color-mix(in srgb, var(--theme-primary) 25%, transparent)'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div 
              className="w-3 h-3 rounded-full shadow-lg"
              style={{
                backgroundColor: 'var(--theme-accent)',
                boxShadow: `0 4px 14px color-mix(in srgb, var(--theme-accent) 30%, transparent)`
              }}
            ></div>
            <div 
              className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-60"
              style={{
                backgroundColor: 'var(--theme-accent)'
              }}
            ></div>
          </div>
          <span className="text-sm font-semibold text-slate-100">{activeStreamUsername}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">LIVE</span>
        </div>
      </div>
    );
  }

  // Offline state
  return (
    <div 
      className="flex items-center justify-between p-4 glass-theme rounded-xl shadow-lg"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--theme-primary) 8%, #1e293b)',
        borderColor: 'color-mix(in srgb, var(--theme-primary) 25%, transparent)'
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-3 h-3 rounded-full shadow-lg bg-gray-500 opacity-50"></div>
        </div>
        <span className="text-sm font-semibold text-slate-100">{activeStreamUsername}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Offline</span>
      </div>
    </div>
  );
}

export function ChatPanel({ 
  streams, 
  activeStreamUsername, 
  onStreamChange, 
  width, 
  onWidthChange,
  isMobile = false
}: ChatPanelProps) {
  const { themeMatch } = useTheme();
  const chatRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [hasShownDisclaimer, setHasShownDisclaimer] = useState(false);

  // Constants for resize limits
  const MIN_WIDTH = 300; // Minimum chat panel width
  const MAX_WIDTH = 600; // Maximum chat panel width

  const toggleHeaderCollapse = useCallback(() => {
    setIsHeaderCollapsed(prev => !prev);
  }, []);

  const toggleChatCollapse = useCallback(() => {
    setIsChatCollapsed(prev => !prev);
  }, []);

  const handleDisclaimerClose = useCallback(() => {
    setShowDisclaimer(false);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStartX(e.clientX);
    setResizeStartWidth(width);
    
    // Prevent text selection and pointer events during resize
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';
    document.body.style.pointerEvents = 'none';
  }, [width]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    e.preventDefault();
    // Calculate how much the mouse has moved from the starting position
    const mouseDelta = resizeStartX - e.clientX;
    // Add this delta to the starting width (positive = wider, negative = thinner)
    const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, resizeStartWidth + mouseDelta));
    
    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      onWidthChange(newWidth);
    });
  }, [isResizing, resizeStartX, resizeStartWidth, onWidthChange]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    
    // Restore normal cursor, text selection, and pointer events
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    document.body.style.pointerEvents = '';
  }, []);

  // Set up global mouse event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Handle user-initiated stream change
  const handleUserStreamChange = useCallback((username: string) => {
    // Show disclaimer only the first time user manually changes to a different stream
    if (streams.length > 1 && username !== activeStreamUsername && !hasShownDisclaimer) {
      setShowDisclaimer(true);
      setHasShownDisclaimer(true);
    }
    onStreamChange(username);
  }, [activeStreamUsername, onStreamChange, streams.length, hasShownDisclaimer]);

  const getParentDomain = () => {
    if (typeof window !== "undefined") {
      return window.location.hostname;
    }
    return "localhost";
  };

  if (streams.length === 0) {
    return (
      <div 
        ref={containerRef}
        className={`h-full flex items-center justify-center glass-theme shadow-2xl ${
          isMobile 
            ? "w-full border-t"
            : "border-l"
        }`}
        style={{ 
          width: isMobile ? '100%' : `${width}px`,
          borderColor: 'color-mix(in srgb, var(--theme-primary) 20%, transparent)'
        }}
      >
        <div className="text-center space-y-4">
          <div 
            className="w-16 h-16 mx-auto rounded-2xl glass-theme flex items-center justify-center shadow-xl"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, transparent)',
              borderColor: 'color-mix(in srgb, var(--theme-primary) 20%, transparent)'
            }}
          >
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm font-semibold">No chat available</p>
          <div className="w-2 h-2 bg-theme-primary rounded-full animate-pulse mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`h-full flex relative shadow-2xl glass-theme ${
        isMobile 
          ? "w-full border-t"
          : "border-l"
      } ${isChatCollapsed ? 'w-12' : ''}`}
      style={{ 
        width: isMobile ? '100%' : (isChatCollapsed ? '48px' : `${width}px`),
        transition: isResizing || isMobile ? 'none' : 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        borderColor: 'color-mix(in srgb, var(--theme-primary) 20%, transparent)',
        boxShadow: `0 25px 50px -12px color-mix(in srgb, var(--theme-primary) 10%, transparent)`
      }}
    >
      {/* Resize Handle - Only show on desktop when chat is expanded */}
      {!isMobile && !isChatCollapsed && (
        <div
          ref={resizeHandleRef}
          className={`absolute -left-3 top-0 bottom-0 w-6 cursor-ew-resize group z-100 transition-all duration-300 ease-out ${
            isResizing ? '' : 'bg-transparent'
          }`}
          style={{
            backgroundColor: isResizing 
              ? 'color-mix(in srgb, var(--theme-primary) 15%, transparent)' 
              : undefined
          }}
          onMouseDown={handleMouseDown}
          onMouseEnter={() => {
            if (!isResizing) {
              (resizeHandleRef.current as any).style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 10%, transparent)';
            }
          }}
          onMouseLeave={() => {
            if (!isResizing) {
              (resizeHandleRef.current as any).style.backgroundColor = 'transparent';
            }
          }}
        >
          {/* Visual indicator for resize handle */}
          <div 
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-0.5 transition-all duration-300 ease-out rounded-full ${
              isResizing 
                ? 'h-24' 
                : 'h-12 group-hover:h-20'
            }`}
            style={{
              background: isResizing 
                ? `linear-gradient(to bottom, var(--theme-primary), var(--theme-secondary), var(--theme-primary))`
                : `linear-gradient(to bottom, #64748b, #475569)`,
              boxShadow: isResizing 
                ? `0 10px 25px color-mix(in srgb, var(--theme-primary) 30%, transparent)`
                : undefined
            }}
            onMouseEnter={(e) => {
              if (!isResizing) {
                e.currentTarget.style.background = `linear-gradient(to bottom, var(--theme-secondary), var(--theme-primary))`;
                e.currentTarget.style.boxShadow = `0 10px 25px color-mix(in srgb, var(--theme-primary) 20%, transparent)`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isResizing) {
                e.currentTarget.style.background = `linear-gradient(to bottom, #64748b, #475569)`;
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          />
          
          {/* Grip dots */}
          <div className={`absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 transition-all duration-300 ${
            isResizing ? 'opacity-90' : 'opacity-0 group-hover:opacity-70'
          }`}>
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className="w-1.5 h-1.5 rounded-full shadow-sm" 
                style={{ 
                  animationDelay: `${i * 100}ms`,
                  backgroundColor: 'var(--theme-secondary)'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Collapsed Chat Toggle Button - Desktop only */}
      {!isMobile && isChatCollapsed && (
        <div className="flex flex-col h-full w-full">
          {/* Top section with expand button */}
          <div className="flex justify-center pt-4 pb-3">
            <button
              onClick={toggleChatCollapse}
              className="w-8 h-8 rounded-lg glass-theme transition-all duration-200 group flex items-center justify-center cursor-pointer hover:cursor-pointer active:cursor-pointer"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--theme-primary) 20%, transparent)',
                borderColor: 'color-mix(in srgb, var(--theme-primary) 30%, transparent)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 30%, transparent)';
                e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-primary) 50%, transparent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 20%, transparent)';
                e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-primary) 30%, transparent)';
              }}
              title="Show chat"
            >
              <svg 
                className="w-4 h-4 text-theme-primary group-hover:text-theme-secondary transition-colors duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          
          {/* Chat icon and vertical text */}
          <div className="flex flex-col items-center justify-center flex-1 space-y-4">
            {/* Twitch-style chat icon */}
            <div className="w-6 h-6 flex items-center justify-center">
              <svg className="w-5 h-5 text-theme-primary opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            
            {/* Vertical "CHAT" text in Twitch style */}
            <div className="transform -rotate-90 origin-center">
              <span className="text-xs font-bold text-theme-primary opacity-60 tracking-[0.2em] uppercase">CHAT</span>
            </div>
          </div>
          
          {/* Bottom accent */}
          <div 
            className="h-1"
            style={{
              background: `linear-gradient(to right, transparent, color-mix(in srgb, var(--theme-primary) 30%, transparent), transparent)`
            }}
          ></div>
        </div>
      )}

      {/* Chat Disclaimer */}
      <ChatDisclaimer
        isVisible={showDisclaimer}
        onClose={handleDisclaimerClose}
        autoCloseDelay={6000} // 6 seconds
      />

      {/* Chat Content */}
      <div 
        className={`flex flex-col flex-1 overflow-hidden transition-opacity duration-300 ${
          !isMobile && isChatCollapsed ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          visibility: !isMobile && isChatCollapsed ? 'hidden' : 'visible',
          pointerEvents: !isMobile && isChatCollapsed ? 'none' : 'auto'
        }}
      >
          {/* Chat Header */}
          <div 
            className="border-b glass-theme"
            style={{
              borderColor: 'color-mix(in srgb, var(--theme-primary) 20%, transparent)',
              backgroundColor: 'color-mix(in srgb, var(--theme-primary) 3%, transparent)'
            }}
          >
            {/* Header Title Bar - Always Visible */}
            <div className={`${isMobile ? 'px-3 py-2' : 'px-2 py-3'} flex items-center justify-between`}>
              {/* Collapse Chat Button - Desktop only */}
              {!isMobile && (
                <button
                  onClick={toggleChatCollapse}
                  className="w-8 h-8 rounded-md bg-transparent transition-all duration-150 group cursor-pointer hover:cursor-pointer active:cursor-pointer flex items-center justify-center"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 20%, transparent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title="Hide chat"
                >
                  <svg 
                    className="w-4 h-4 text-slate-400 group-hover:text-theme-primary transition-colors duration-150" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Centered Live indicator and title */}
              <div className={`flex items-center gap-3 ${isMobile ? 'mx-auto' : 'absolute left-1/2 transform -translate-x-1/2'}`}>
                <div className="relative">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: `linear-gradient(to right, var(--theme-primary), var(--theme-secondary))`
                    }}
                  ></div>
                  <div 
                    className="absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-60"
                    style={{
                      background: `linear-gradient(to right, var(--theme-primary), var(--theme-secondary))`
                    }}
                  ></div>
                </div>
                <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent tracking-tight whitespace-nowrap`}>
                  Stream Chat
                </h3>
              </div>
              
              {/* Collapse Header Toggle Button - Desktop only */}
              {!isMobile && (
                <button
                  onClick={toggleHeaderCollapse}
                  className="w-8 h-8 rounded-md bg-transparent transition-all duration-150 group cursor-pointer hover:cursor-pointer active:cursor-pointer flex items-center justify-center"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 10%, transparent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title={isHeaderCollapsed ? "Show chat settings" : "Hide chat settings"}
                >
                  <svg 
                    className={`w-4 h-4 text-slate-400 group-hover:text-theme-primary transition-all duration-200 ${
                      isHeaderCollapsed ? 'rotate-180' : 'rotate-0'
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Collapsible Content - Desktop only */}
            {!isMobile && (
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isHeaderCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
                }`}
              >
                <div className="px-2 pb-4">
                  {/* Stream selector */}
                  {streams.length > 1 && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Active Stream
                      </label>
                      <div className="relative mt-2">
                        <select
                          value={activeStreamUsername}
                          onChange={(e) => handleUserStreamChange(e.target.value)}
                          className="w-full appearance-none glass-theme rounded-xl px-4 py-3.5 text-white text-sm font-medium focus:outline-none transition-all duration-300 cursor-pointer shadow-lg"
                          style={{
                            backgroundColor: 'color-mix(in srgb, var(--theme-primary) 8%, #1e293b)',
                            borderColor: 'color-mix(in srgb, var(--theme-primary) 30%, transparent)'
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'var(--theme-primary)';
                            e.currentTarget.style.boxShadow = `0 0 0 2px color-mix(in srgb, var(--theme-primary) 50%, transparent)`;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-primary) 30%, transparent)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          onMouseEnter={(e) => {
                            if (e.currentTarget !== document.activeElement) {
                              e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 12%, #1e293b)';
                              e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-primary) 40%, transparent)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (e.currentTarget !== document.activeElement) {
                              e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 8%, #1e293b)';
                              e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-primary) 30%, transparent)';
                            }
                          }}
                        >
                          {streams.map((stream) => (
                            <option key={stream.username} value={stream.username} className="bg-slate-800 text-white">
                              {stream.username}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {streams.length === 1 && (
                    <SingleStreamStatus activeStreamUsername={activeStreamUsername} />
                  )}
                </div>
              </div>
            )}

            {/* Mobile Stream Selector */}
            {isMobile && streams.length > 1 && (
              <div className="px-3 pb-2">
                <div className="relative">
                  <select
                    value={activeStreamUsername}
                    onChange={(e) => handleUserStreamChange(e.target.value)}
                    className="w-full appearance-none glass-theme rounded-lg px-3 py-2 text-white text-sm font-medium focus:outline-none transition-all duration-300 cursor-pointer shadow-lg"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--theme-primary) 8%, #1e293b)',
                      borderColor: 'color-mix(in srgb, var(--theme-primary) 30%, transparent)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--theme-primary)';
                      e.currentTarget.style.boxShadow = `0 0 0 2px color-mix(in srgb, var(--theme-primary) 50%, transparent)`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-primary) 30%, transparent)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onMouseEnter={(e) => {
                      if (e.currentTarget !== document.activeElement) {
                        e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 12%, #1e293b)';
                        e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-primary) 40%, transparent)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (e.currentTarget !== document.activeElement) {
                        e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 8%, #1e293b)';
                        e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-primary) 30%, transparent)';
                      }
                    }}
                  >
                    {streams.map((stream) => (
                      <option key={stream.username} value={stream.username} className="bg-slate-800 text-white">
                        {stream.username}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat iframe */}
          <div 
            className="flex-1 relative overflow-hidden"
            style={{ 
              pointerEvents: isResizing ? 'none' : 'auto' 
            }}
          >
            {streams.length > 0 ? (
              <div className="w-full h-full relative">
                {/* Render all chat iframes - keep them mounted to prevent refresh */}
                {streams.map((stream) => {
                  const streamChatUrl = `https://www.twitch.tv/embed/${encodeURIComponent(stream.username)}/chat?parent=${getParentDomain()}&darkpopout`;
                  const isActiveChat = stream.username === activeStreamUsername;
                  
                  return (
                    <div
                      key={stream.username}
                      className={`absolute inset-0 transition-opacity duration-200 ${
                        isActiveChat ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                      style={{ 
                        visibility: isActiveChat ? 'visible' : 'hidden',
                        pointerEvents: isActiveChat && !isResizing ? 'auto' : 'none'
                      }}
                    >
                      <iframe
                        ref={isActiveChat ? chatRef : undefined}
                        src={streamChatUrl}
                        width="100%"
                        height="100%"
                        style={{ border: "none" }}
                        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation allow-modals"
                        className="w-full h-full rounded-none bg-slate-900"
                      />
                    </div>
                  );
                })}
                
                {/* Overlay gradients for better integration - only on active chat */}
                <div 
                  className="absolute inset-x-0 top-0 h-px pointer-events-none z-20"
                  style={{
                    background: `linear-gradient(to right, transparent, color-mix(in srgb, var(--theme-primary) 40%, transparent), transparent)`
                  }}
                ></div>
                <div 
                  className="absolute inset-x-0 bottom-0 h-px pointer-events-none z-20"
                  style={{
                    background: `linear-gradient(to right, transparent, color-mix(in srgb, var(--theme-primary) 40%, transparent), transparent)`
                  }}
                ></div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-sm font-medium">No streams available</p>
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
} 