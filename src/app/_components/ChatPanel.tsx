"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { StreamConfig } from "./MultiTwitchViewer";

interface ChatPanelProps {
  streams: StreamConfig[];
  activeStreamUsername: string;
  onStreamChange: (username: string) => void;
  width: number;
  onWidthChange: (width: number) => void;
}

export function ChatPanel({ 
  streams, 
  activeStreamUsername, 
  onStreamChange, 
  width, 
  onWidthChange 
}: ChatPanelProps) {
  const chatRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);

  // Constants for resize limits
  const MIN_WIDTH = 300; // Minimum chat panel width
  const MAX_WIDTH = 600; // Maximum chat panel width

  const toggleHeaderCollapse = useCallback(() => {
    setIsHeaderCollapsed(prev => !prev);
  }, []);

  const toggleChatCollapse = useCallback(() => {
    setIsChatCollapsed(prev => !prev);
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
        className="h-full flex items-center justify-center bg-gradient-to-b from-slate-950/90 via-slate-900/95 to-slate-950/90 backdrop-blur-xl border-l border-slate-700/30 shadow-2xl"
        style={{ width: `${width}px` }}
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center backdrop-blur-sm shadow-xl">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm font-semibold">No chat available</p>
          <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse mx-auto"></div>
        </div>
      </div>
    );
  }



  return (
    <div 
      ref={containerRef}
      className="h-full flex bg-gradient-to-b from-slate-950/90 via-slate-900/95 to-slate-950/90 backdrop-blur-xl border-l border-slate-700/30 relative shadow-2xl"
      style={{ 
        width: isChatCollapsed ? '48px' : `${width}px`,
        transition: isResizing ? 'none' : 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Resize Handle - Only show when chat is expanded */}
      {!isChatCollapsed && (
        <div
          ref={resizeHandleRef}
          className={`absolute -left-3 top-0 bottom-0 w-6 cursor-ew-resize group z-10 transition-all duration-300 ease-out ${
            isResizing ? 'bg-violet-500/15' : 'bg-transparent hover:bg-violet-500/10'
          }`}
          onMouseDown={handleMouseDown}
        >
          {/* Visual indicator for resize handle */}
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-0.5 transition-all duration-300 ease-out rounded-full ${
            isResizing 
              ? 'h-24 bg-gradient-to-b from-violet-400 via-purple-400 to-violet-400 shadow-lg shadow-violet-500/30' 
              : 'h-12 bg-gradient-to-b from-slate-500 to-slate-600 group-hover:h-20 group-hover:from-violet-300 group-hover:to-purple-300 group-hover:shadow-lg group-hover:shadow-violet-500/20'
          }`} />
          
          {/* Grip dots */}
          <div className={`absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 transition-all duration-300 ${
            isResizing ? 'opacity-90' : 'opacity-0 group-hover:opacity-70'
          }`}>
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className="w-1.5 h-1.5 bg-violet-300 rounded-full shadow-sm" 
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Collapsed Chat Toggle Button */}
      {isChatCollapsed && (
        <div className="flex flex-col h-full w-full">
          {/* Top section with expand button */}
          <div className="flex justify-center pt-4 pb-3">
            <button
              onClick={toggleChatCollapse}
              className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 hover:border-purple-400/50 transition-all duration-200 group flex items-center justify-center backdrop-blur-sm cursor-pointer hover:cursor-pointer active:cursor-pointer"
              title="Show chat"
            >
              <svg 
                className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors duration-200" 
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
              <svg className="w-5 h-5 text-purple-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            
            {/* Vertical "CHAT" text in Twitch style */}
            <div className="transform -rotate-90 origin-center">
              <span className="text-xs font-bold text-purple-400/60 tracking-[0.2em] uppercase">CHAT</span>
            </div>
          </div>
          
          {/* Bottom accent */}
          <div className="h-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        </div>
      )}

      {/* Chat Content */}
      <div 
        className={`flex flex-col flex-1 overflow-hidden transition-opacity duration-300 ${
          isChatCollapsed ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          visibility: isChatCollapsed ? 'hidden' : 'visible',
          pointerEvents: isChatCollapsed ? 'none' : 'auto'
        }}
      >
          {/* Chat Header */}
          <div className="border-b border-slate-700/40 bg-slate-950/50 backdrop-blur-sm">
            {/* Header Title Bar - Always Visible */}
            <div className="px-2 py-3 flex items-center justify-between">
              {/* Collapse Chat Button - Left side */}
              <button
                onClick={toggleChatCollapse}
                className="w-8 h-8 rounded-md bg-transparent hover:bg-purple-600/20 transition-all duration-150 group cursor-pointer hover:cursor-pointer active:cursor-pointer flex items-center justify-center"
                title="Hide chat"
              >
                <svg 
                  className="w-4 h-4 text-slate-400 group-hover:text-purple-300 transition-colors duration-150" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Centered Live indicator and title */}
              <div className="flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  <div className="w-2 h-2 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full animate-ping opacity-60"></div>
                </div>
                <h3 className="text-base font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent tracking-tight whitespace-nowrap">
                  Stream Chat
                </h3>
              </div>
              
              {/* Collapse Header Toggle Button - Right side */}
              <button
                onClick={toggleHeaderCollapse}
                className="w-8 h-8 rounded-md bg-transparent hover:bg-slate-700/30 transition-all duration-150 group cursor-pointer hover:cursor-pointer active:cursor-pointer flex items-center justify-center"
                title={isHeaderCollapsed ? "Show chat settings" : "Hide chat settings"}
              >
                <svg 
                  className={`w-4 h-4 text-slate-400 group-hover:text-slate-300 transition-all duration-200 ${
                    isHeaderCollapsed ? 'rotate-180' : 'rotate-0'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Collapsible Content */}
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
                        onChange={(e) => onStreamChange(e.target.value)}
                        className="w-full appearance-none bg-slate-800/70 border border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400/50 transition-all duration-300 hover:bg-slate-800/90 hover:border-slate-500/70 cursor-pointer backdrop-blur-sm shadow-lg"
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
                  <div className="flex items-center justify-between p-4 bg-slate-800/60 rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/30"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-60"></div>
                      </div>
                      <span className="text-sm font-semibold text-slate-100">{activeStreamUsername}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">LIVE</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat iframe */}
          <div className="flex-1 relative overflow-hidden">
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
                        pointerEvents: isActiveChat ? 'auto' : 'none'
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
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-600/40 to-transparent pointer-events-none z-20"></div>
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-600/40 to-transparent pointer-events-none z-20"></div>
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

          {/* Chat footer */}
          <div className="px-5 py-2.5 border-t border-slate-700/40 bg-slate-950/60 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 268" className="flex-shrink-0">
                <path fill="#5865F2" d="M17.458 0L0 46.556v186.201h63.983v34.934h34.931l34.898-34.934h52.36L256 162.954V0H17.458zm23.259 23.263H232.73v128.029l-40.739 40.741H128L93.113 226.92v-34.887H40.717V23.263zm64.008 69.847v69.841h23.263V93.11h-23.263zm63.997 0v69.841h23.263V93.11H168.72z"/>
              </svg>
              <p className="text-xs text-slate-500 font-semibold tracking-wide">
                Powered by Twitch
              </p>
            </div>
          </div>
      </div>
    </div>
  );
} 