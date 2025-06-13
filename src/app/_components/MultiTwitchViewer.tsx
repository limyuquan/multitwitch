"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { StreamSetup } from "./StreamSetup";
import { VideoGrid } from "./VideoGrid";
import { ChatPanel } from "./ChatPanel";
import { ViewModeToggle } from "./ViewModeToggle";
import { StreamManagerModal } from "./StreamManagerModal";
import { EmptyStreamState } from "./EmptyStreamState";

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
    return <StreamSetup onStreamsSetup={handleStreamsSetup} />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden">
      {/* Header */}
      <div 
        className={`absolute top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl transition-all duration-500 ${
          isHeaderVisible 
            ? 'translate-y-0 opacity-100 shadow-violet-500/10' 
            : '-translate-y-full opacity-0 shadow-transparent'
        }`}
        style={{
          transitionTimingFunction: isHeaderVisible 
            ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' // Spring-like entrance
            : 'cubic-bezier(0.4, 0, 0.2, 1)', // Smooth, controlled exit
          transitionDelay: isHeaderVisible ? '0ms' : '0ms', // No delay for header to feel responsive
        }}
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={handleBackToSetup}
                className="group flex items-center gap-1 text-slate-400 hover:text-violet-400 transition-all duration-300 hover:-translate-x-1"
              >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium cursor-pointer hover:cursor-pointer active:cursor-pointer">Back to Setup</span>
              </button>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                    {/* Custom Multi-Stream Icon */}
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" opacity="0.7"/>
                      <path d="M5 5h4v4H5V5zm10 0h4v4h-4V5zM5 15h4v4H5v-4zm10 0h4v4h-4v-4z"/>
                      <circle cx="7" cy="7" r="1" fill="white"/>
                      <circle cx="17" cy="7" r="1" fill="white"/>
                      <circle cx="7" cy="17" r="1" fill="white"/>
                      <circle cx="17" cy="17" r="1" fill="white"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      MultiTwitch
                    </h1>
                    <div className="text-sm text-slate-400 font-medium">
                      {streams.length} stream{streams.length === 1 ? "" : "s"} active
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsStreamManagerOpen(true)}
                className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl font-medium transition-all duration-300 text-white shadow-lg hover:shadow-violet-500/25 hover:scale-105 cursor-pointer hover:cursor-pointer active:cursor-pointer"
              >
                <svg className="w-4 h-4 transition-transform group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>Manage Streams</span>
              </button>
              
              {streams.length > 1 && (
                <ViewModeToggle
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  streamCount={streams.length}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className={`flex flex-1 transition-all duration-500 ${
          isHeaderVisible ? 'pt-20' : 'pt-0'
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
            <div className="flex-1 min-w-0 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-transparent pointer-events-none z-10" />
              <VideoGrid
                streams={streams}
                viewMode={viewMode}
                activeStreamIndex={activeStreamIndex}
                onActiveStreamChange={setActiveStreamIndex}
                onStreamReorder={handleStreamReorder}
                onStreamRemove={(stream) => {
                  const updatedStreams = streams.filter(s => s.username !== stream.username);
                  handleStreamsUpdate(updatedStreams);
                }}
              />
            </div>

            {/* Chat Panel */}
            <ChatPanel
              streams={streams}
              activeStreamUsername={activeChatStream}
              onStreamChange={setActiveChatStream}
              width={chatPanelWidth}
              onWidthChange={setChatPanelWidth}
            />
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
  );
} 