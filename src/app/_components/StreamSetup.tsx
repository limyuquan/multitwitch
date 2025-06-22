"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { StreamConfig } from "./MultiTwitchViewer";
import { AutocompleteInput } from "./AutocompleteInput";

interface StreamSetupProps {
  onStreamsSetup: (streams: StreamConfig[]) => void;
}

export function StreamSetup({ onStreamsSetup }: StreamSetupProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [streamList, setStreamList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileDisclaimer, setShowMobileDisclaimer] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(false);
  const [previouslyWatched, setPreviouslyWatched] = useState<string[]>([]);
  const [showAllPrevious, setShowAllPrevious] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // localStorage utilities
  const STORAGE_KEY = 'multitwitch-previously-watched';
  
  const loadPreviouslyWatched = (): string[] => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      }
    } catch (error) {
      console.error('Error loading previously watched streamers:', error);
    }
    return [];
  };

  const savePreviouslyWatched = (streamers: string[]) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(streamers));
      }
    } catch (error) {
      console.error('Error saving previously watched streamers:', error);
    }
  };

  const addToPreviouslyWatched = (streamers: string[]) => {
    const current = loadPreviouslyWatched();
    const uniqueStreamers = [...new Set([...streamers, ...current])];
    const limited = uniqueStreamers.slice(0, 12); // Limit to 12 most recent
    savePreviouslyWatched(limited);
    setPreviouslyWatched(limited);
  };

  // Load previously watched streamers on mount
  useEffect(() => {
    const loaded = loadPreviouslyWatched();
    setPreviouslyWatched(loaded);
  }, []);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent) || window.innerWidth < 768;
      const isDesktopDevice = window.innerWidth >= 1024;
      
      setIsMobile(isMobileDevice);
      setIsDesktop(isDesktopDevice);
      
      // Only show disclaimer if mobile and not previously dismissed
      if (isMobileDevice && !disclaimerDismissed) {
        setShowMobileDisclaimer(true);
      } else if (!isMobileDevice) {
        setShowMobileDisclaimer(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [disclaimerDismissed]);

  // Setup dark theme and scroll behavior
  useEffect(() => {
    // Set dark theme for body and html
    document.body.style.backgroundColor = '#0e0e10';
    document.documentElement.style.backgroundColor = '#0e0e10';
    document.body.style.colorScheme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
    
    if (isLoading) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Allow only vertical scrolling
      document.body.style.overflowX = 'hidden';
      document.body.style.overflowY = 'auto';
      document.documentElement.style.overflowX = 'hidden';
      document.documentElement.style.overflowY = 'auto';
    }

    // Cleanup on unmount - restore defaults
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.overflowX = '';
      document.body.style.overflowY = '';
      document.documentElement.style.overflowX = '';
      document.documentElement.style.overflowY = '';
    };
  }, [isLoading]);

  const addStreamByValue = (value: string) => {
    const trimmedValue = value.trim().toLowerCase();
    if (trimmedValue && !streamList.includes(trimmedValue)) {
      setStreamList([...streamList, trimmedValue]);
      setInputValue("");
    }
  };

  const handleAddStream = () => {
    addStreamByValue(inputValue);
  };

  const handleRemoveStream = (index: number) => {
    setStreamList(streamList.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddStream();
    }
  };

  const handleStartWatching = () => {
    if (streamList.length > 0) {
      setIsLoading(true);
      // Save to previously watched before starting
      addToPreviouslyWatched(streamList);
      // Dramatic swooping effect: wait for exit animation, then entrance
      setTimeout(() => {
        const streamConfigs: StreamConfig[] = streamList.map(username => ({
          username,
          isActive: true,
        }));
        onStreamsSetup(streamConfigs);
      }, 1200); // Increased delay to allow for dramatic animation
    }
  };

  const handleAddFromPrevious = (streamer: string) => {
    if (!streamList.includes(streamer)) {
      setStreamList([...streamList, streamer]);
    }
  };

  return (
    <div 
      className={`min-h-screen bg-[#0e0e10] text-white relative ${isLoading ? 'animate-smooth-zoom-out' : 'animate-smooth-zoom-in'}`} 
      style={{ 
        width: '100vw',
        maxWidth: '100vw',
        minHeight: '100vh',
        overflowX: 'hidden'
      }}
    >
      {/* Mobile Disclaimer */}
      {showMobileDisclaimer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-[#18181b] via-[#1f1f23] to-[#18181b] rounded-3xl border border-[#9146ff]/30 p-6 max-w-sm w-full shadow-2xl shadow-[#9146ff]/20 animate-scale-in">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold text-white">
                Best Experience on Desktop
              </h3>
              <p className="text-[#a1a1aa] text-sm leading-relaxed">
                MultiTwitcher is optimized for desktop viewing with multiple streams and chat windows. 
                For the best experience, we recommend using a desktop or laptop computer.
              </p>
              
              {/* Feature limitations on mobile */}
              <div className="bg-[#0e0e10]/50 rounded-xl p-4 space-y-2">
                <p className="text-xs text-[#71717a] font-medium">Limited on mobile:</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-[#27272a] px-2 py-1 rounded-md text-[#a1a1aa]">Multi-view layout</span>
                  <span className="bg-[#27272a] px-2 py-1 rounded-md text-[#a1a1aa]">Stream controls</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={() => {
                  setShowMobileDisclaimer(false);
                  setDisclaimerDismissed(true);
                }}
                className="w-full py-3 bg-gradient-to-r from-[#9146ff] to-[#772ce8] hover:from-[#8b5cf6] hover:to-[#6d28d9] rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-[#9146ff]/30"
              >
                Continue Anyway
              </button>
            </div>

            {/* Dismiss hint */}
            <p className="text-center text-xs text-[#71717a] mt-4">
              You can always continue on mobile, but desktop is recommended
            </p>
          </div>
        </div>
      )}

      {/* New Geometric Background - Hidden on mobile, full on desktop */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#9146ff]/6 via-[#0e0e10] to-[#772ce8]/6" />
      
      {/* Geometric shapes - Hidden on mobile for cleaner look */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-[#9146ff]/20 rounded-full animate-spin-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 border border-[#772ce8]/15 rotate-45 animate-pulse-slow" />
        <div className="absolute top-3/4 left-1/2 w-32 h-32 border-2 border-[#9146ff]/25 rotate-12 animate-float-gentle" />
        <div className="absolute top-1/6 right-1/3 w-24 h-24 bg-gradient-to-br from-[#9146ff]/10 to-[#772ce8]/10 rounded-lg rotate-45 animate-drift" />
      </div>

      {/* Subtle grid pattern - Reduced opacity on mobile */}
      <div className="absolute inset-0 opacity-5 lg:opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: `
            linear-gradient(rgba(145, 70, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(145, 70, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      <div className="min-h-screen flex items-start lg:items-start justify-center p-0 lg:p-6 relative z-10 pt-8 lg:pt-16 pb-6 lg:pb-8">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-0 lg:gap-12 items-start lg:items-center">
          
          {/* Left Side - Hero Section - Modern mobile design */}
          <div className="bg-[#1a1a1a] lg:bg-transparent px-6 py-8 lg:p-0 lg:space-y-8 relative order-1 lg:order-1">
            {/* Modern mobile app header */}
            <div className="flex flex-col items-center lg:items-start space-y-6">
              {/* App icon - modern mobile style */}
              <div className="relative flex justify-center lg:justify-start">
                <div className="absolute inset-0 bg-gradient-to-r from-[#9146ff]/20 via-[#772ce8]/20 to-[#9146ff]/20 rounded-full blur-3xl animate-pulse-glow hidden lg:block" />
                <div className="relative inline-flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-[#9146ff] via-[#8b5cf6] to-[#772ce8] rounded-3xl lg:rounded-3xl shadow-2xl shadow-[#9146ff]/30 transform hover:scale-110 hover:rotate-6 transition-all duration-700 group cursor-grab hover:cursor-grabbing">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#9146ff] to-[#772ce8] rounded-3xl lg:rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-700 hidden lg:block" />
                  <div className="absolute inset-2 bg-gradient-to-br from-[#a855f7] to-[#7c3aed] rounded-2xl lg:rounded-2xl opacity-50 hidden lg:block" />
                  {/* Modern app icon */}
                  <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white relative z-10 transform group-hover:scale-125 transition-transform duration-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" opacity="0.8"/>
                    <path d="M5 5h4v4H5V5zm10 0h4v4h-4V5zM5 15h4v4H5v-4zm10 0h4v4h-4v-4z"/>
                    <circle cx="7" cy="7" r="1.5" fill="white"/>
                    <circle cx="17" cy="7" r="1.5" fill="white"/>
                    <circle cx="7" cy="17" r="1.5" fill="white"/>
                    <circle cx="17" cy="17" r="1.5" fill="white"/>
                  </svg>
                  <div className="absolute -inset-6 bg-gradient-to-r from-[#9146ff]/30 via-transparent to-[#772ce8]/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 hidden lg:block" />
                </div>
              </div>

              {/* Modern app title and description */}
              <div className="space-y-3 lg:space-y-6 text-center lg:text-left">
                <div className="relative">
                  <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-black text-white lg:text-transparent lg:bg-gradient-to-r lg:from-white lg:via-[#f8fafc] lg:to-[#e2e8f0] lg:bg-clip-text leading-tight">
                    Multi<span className="text-transparent bg-gradient-to-r from-[#9146ff] via-[#8b5cf6] to-[#772ce8] bg-clip-text">Twitcher</span>
                  </h1>
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#9146ff]/10 via-transparent to-[#772ce8]/10 blur-xl opacity-50 animate-pulse-slow hidden lg:block" />
                </div>
                
                <p className="text-base sm:text-lg lg:text-2xl xl:text-3xl text-[#9ca3af] lg:text-[#a1a1aa] font-normal lg:font-medium leading-relaxed px-2 lg:px-0">
                  Watch multiple streams simultaneously
                </p>
                
                {/* Status indicator - modern mobile style */}
                <div className="flex items-center justify-center lg:justify-start gap-2 lg:gap-4 text-sm lg:text-lg">
                  <div className="flex items-center gap-2 bg-[#16a34a]/10 px-3 py-1.5 rounded-full border border-[#16a34a]/20">
                    <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-[#22c55e] rounded-full animate-pulse" />
                    <span className="text-[#22c55e] font-medium text-sm">Live</span>
                  </div>
                  <span className="text-[#6b7280] hidden lg:block">Perfect for watching multiple POVs</span>
                </div>
              </div>
            </div>

            {/* Feature highlights - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8">
              {[
                { icon: "👥", title: "Multi-View", desc: "Watch multiple streams at once, and resize them to your liking" },
                { icon: "🎨", title: "Custom Group Themes", desc: "Get custom theme for the streamer groups you watch" },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group p-4 bg-gradient-to-br from-[#18181b]/80 to-[#27272a]/60 rounded-xl border border-[#3f3f46]/50 backdrop-blur-sm hover:border-[#9146ff]/50 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-[#9146ff]/20 cursor-default"
                  style={{ animationDelay: `${i * 200}ms` }}
                >
                  <div className="text-2xl mb-2 transform group-hover:scale-105 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-[#a1a1aa] group-hover:text-white transition-colors">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Theme Preview Button - Desktop only */}
            <div className="hidden lg:block">
              <button
                onClick={() => router.push('/themes')}
                className="group relative flex items-center gap-4 p-6 bg-gradient-to-br from-[#18181b]/90 via-[#1f1f23]/80 to-[#18181b]/90 border border-[#3f3f46]/50 backdrop-blur-sm rounded-2xl hover:border-[#9146ff]/60 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#9146ff]/30 cursor-pointer w-full text-left overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#9146ff]/5 via-[#772ce8]/5 to-[#9146ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -inset-6 bg-gradient-to-r from-[#9146ff]/20 via-transparent to-[#772ce8]/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Icon */}
                <div className="relative w-16 h-16 bg-gradient-to-br from-[#9146ff] via-[#8b5cf6] to-[#772ce8] rounded-2xl flex items-center justify-center shadow-xl shadow-[#9146ff]/30 group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                
                {/* Content */}
                <div className="relative flex-1 space-y-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#9146ff] group-hover:to-[#772ce8] group-hover:bg-clip-text transition-all duration-300">
                    Explore Themes
                  </h3>
                  <p className="text-[#a1a1aa] group-hover:text-white transition-colors duration-300 text-sm leading-relaxed">
                    Preview all available streamer group themes and see what colors await when you watch different combinations
                  </p>
                  <div className="flex items-center gap-2 text-[#9146ff] group-hover:text-white transition-colors duration-300 font-medium text-sm pt-1">
                    <span>View all themes</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Right Side - Modern Mobile App Design */}
          <div className="relative order-2 lg:order-2">
            {/* Mobile app-style container */}
            <div className={`relative bg-[#0a0a0a] lg:bg-gradient-to-br lg:from-[#18181b]/90 lg:via-[#1f1f23]/80 lg:to-[#18181b]/90 lg:backdrop-blur-xl rounded-none lg:rounded-3xl border-0 lg:border lg:border-[#3f3f46]/60 px-5 py-6 lg:p-8 xl:p-10 shadow-none lg:shadow-2xl lg:shadow-black/50 hover:shadow-[#9146ff]/20 transition-all duration-700 min-h-screen lg:min-h-0 ${isLoading ? 'animate-dramatic-slide-out' : 'animate-dramatic-slide-in'}`}>
              
              {/* Animated border - Hidden on mobile */}
              <div className="absolute inset-0 rounded-none lg:rounded-3xl bg-gradient-to-r from-[#9146ff]/20 via-[#772ce8]/20 to-[#9146ff]/20 opacity-0 hover:opacity-100 transition-opacity duration-700 blur-sm hidden lg:block" />
              <div className="absolute inset-[1px] rounded-none lg:rounded-3xl bg-gradient-to-br from-[#18181b] to-[#1f1f23] hidden lg:block" />
              
              <div className="relative z-10">
                {/* Modern app header with navigation feel */}
                <div className="flex items-center gap-3 mb-10 lg:mb-8 pt-2">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#9146ff] to-[#772ce8] rounded-2xl flex items-center justify-center shadow-lg shadow-[#9146ff]/20">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Setup Streams</h2>
                    <p className="text-[#8b8b8b] text-sm font-medium mt-0.5">Add your favorite streamers</p>
                  </div>
                  {/* Stream counter badge */}
                  {streamList.length > 0 && (
                    <div className="bg-[#9146ff]/15 border border-[#9146ff]/30 px-3 py-1.5 rounded-full">
                      <span className="text-[#9146ff] text-sm font-semibold">{streamList.length}</span>
                    </div>
                  )}
                </div>

                {/* Previously watched section - Desktop only */}
                {previouslyWatched.length > 0 && (
                  <div className="hidden lg:block space-y-4 pb-6 border-b border-[#3f3f46]/40">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">Previously Watched</h3>
                      <div className="text-[#71717a] text-sm">
                        {previouslyWatched.length} streamer{previouslyWatched.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {(showAllPrevious ? previouslyWatched : previouslyWatched.slice(0, 6)).map((streamer, index) => (
                        <button
                          key={streamer}
                          onClick={() => handleAddFromPrevious(streamer)}
                          disabled={streamList.includes(streamer)}
                          className={`group relative flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] transform ${
                            streamList.includes(streamer)
                              ? 'bg-[#16a34a]/10 border-[#16a34a]/30 cursor-default'
                              : 'bg-[#0e0e10] border-[#3f3f46]/40 hover:border-[#9146ff]/60 hover:bg-[#18181b] cursor-pointer'
                          }`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-[#9146ff]/5 to-[#772ce8]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-[#9146ff] via-[#8b5cf6] to-[#772ce8] flex items-center justify-center flex-shrink-0">
                            <div className="text-sm font-black text-white">
                              {streamer[0]?.toUpperCase()}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0 text-left">
                            <div className={`font-semibold text-sm truncate ${
                              streamList.includes(streamer) ? 'text-[#22c55e]' : 'text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#9146ff] group-hover:to-[#772ce8] group-hover:bg-clip-text'
                            } transition-all duration-300`}>
                              {streamer}
                            </div>
                            <div className="text-xs text-[#71717a] mt-0.5">
                              {streamList.includes(streamer) ? 'Added' : 'Click to add'}
                            </div>
                          </div>
                          
                          {streamList.includes(streamer) ? (
                            <div className="w-5 h-5 text-[#22c55e] flex-shrink-0">
                              <svg fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            </div>
                          ) : (
                            <div className="w-5 h-5 text-[#71717a] group-hover:text-[#9146ff] transition-colors duration-300 flex-shrink-0">
                              <svg fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    {previouslyWatched.length > 6 && (
                      <div className="text-center">
                        <button 
                          onClick={() => setShowAllPrevious(!showAllPrevious)}
                          className="text-[#9146ff] hover:text-[#8b5cf6] text-sm font-medium transition-colors duration-300 hover:scale-105 transform cursor-pointer"
                        >
                          {showAllPrevious 
                            ? 'Show less' 
                            : `Show ${previouslyWatched.length - 6} more`
                          }
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Modern mobile input section */}
                <div className="space-y-8 lg:space-y-6">
                  {/* Input label */}
                  <div className="space-y-3 lg:space-y-4">
                    <label className="block text-white text-base font-semibold tracking-wide lg:hidden">
                      Add Streamer
                    </label>
                    
                    <div className="space-y-4 lg:space-y-0 lg:flex lg:gap-4">
                      <div className="flex-1 relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#9146ff]/20 to-[#772ce8]/20 rounded-3xl lg:rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden lg:block" />
                        <AutocompleteInput
                          ref={inputRef}
                          value={inputValue}
                          onChange={setInputValue}
                          onKeyPress={handleKeyPress}
                          onSelect={addStreamByValue}
                          placeholder="Search streamers..."
                          suggestions={previouslyWatched.filter(streamer => 
                            !streamList.includes(streamer.toLowerCase())
                          )}
                          maxSuggestions={6}
                          className="relative w-full px-6 py-5 lg:px-6 lg:py-5 bg-[#1a1a1a] lg:bg-[#0e0e10] border border-[#2a2a2a] lg:border-[#3f3f46]/60 rounded-3xl lg:rounded-2xl text-white placeholder-[#6b6b6b] lg:placeholder-[#71717a] focus:outline-none focus:border-[#9146ff] focus:bg-[#1c1c1c] lg:focus:bg-[#0e0e10] focus:ring-0 lg:focus:ring-4 lg:focus:ring-[#9146ff]/20 transition-all duration-300 text-lg lg:text-lg font-medium hover:border-[#3a3a3a] lg:hover:border-[#52525b] hover:bg-[#1c1c1c] lg:hover:bg-[#0e0e10] group-hover:shadow-lg group-hover:shadow-[#9146ff]/10 cursor-text"
                        />
                        {/* Input icon */}
                        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                          <svg className="w-5 h-5 text-[#6b6b6b]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                          </svg>
                        </div>
                        <div className="absolute inset-0 rounded-3xl lg:rounded-2xl bg-gradient-to-r from-transparent via-[#9146ff]/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                      
                      <button
                        onClick={handleAddStream}
                        disabled={!inputValue.trim()}
                        className="w-full lg:w-auto px-8 py-5 lg:px-8 lg:py-5 bg-gradient-to-r from-[#9146ff] via-[#8b5cf6] to-[#772ce8] hover:from-[#8b5cf6] hover:via-[#7c3aed] hover:to-[#6d28d9] disabled:from-[#2a2a2a] disabled:to-[#343434] lg:disabled:from-[#333] lg:disabled:to-[#444] disabled:cursor-not-allowed rounded-3xl lg:rounded-2xl font-semibold text-lg lg:text-lg transition-all duration-300 hover:scale-[1.01] lg:hover:scale-110 hover:shadow-2xl hover:shadow-[#9146ff]/50 active:scale-[0.98] disabled:hover:scale-100 text-white transform relative overflow-hidden group cursor-pointer hover:cursor-pointer active:cursor-grabbing"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 hidden lg:block" />
                        <span className="relative flex items-center justify-center gap-3 lg:gap-3">
                          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                          </svg>
                          <span className="font-bold">Add</span>
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Modern stream cards section */}
                  {streamList.length > 0 && (
                    <div className="space-y-3 lg:space-y-4">
                      {/* Section header */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-white text-lg font-bold tracking-tight lg:hidden">
                          Your Streams
                        </h3>
                        <div className="text-[#8b8b8b] text-sm font-medium lg:hidden">
                          {streamList.length} added
                        </div>
                      </div>
                      
                      {/* Stream list */}
                      <div className="space-y-2 lg:space-y-3 max-h-96 lg:max-h-80 overflow-y-auto overflow-x-hidden custom-scrollbar">
                        {streamList.map((stream, index) => (
                          <div
                            key={stream}
                            className="group relative flex items-center justify-between bg-[#1a1a1a] lg:bg-gradient-to-r lg:from-[#0e0e10] lg:via-[#18181b] lg:to-[#0e0e10] border border-[#2a2a2a] lg:border-[#3f3f46]/40 px-4 py-4 lg:px-6 lg:py-5 rounded-3xl lg:rounded-2xl hover:border-[#9146ff]/60 hover:shadow-xl hover:shadow-[#9146ff]/25 transition-all duration-500 animate-slide-in transform hover:scale-[1.01] lg:hover:scale-[1.02] min-w-0 cursor-default"
                            style={{ animationDelay: `${index * 150}ms` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#9146ff]/5 to-[#772ce8]/5 rounded-3xl lg:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <div className="flex items-center gap-4 relative z-10 min-w-0 flex-1">
                              <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl lg:rounded-2xl overflow-hidden shadow-lg lg:shadow-xl transform group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-[#9146ff] via-[#8b5cf6] to-[#772ce8] flex items-center justify-center">
                                  <div className="w-full h-full flex items-center justify-center text-lg lg:text-xl font-black text-white">
                                    {stream[0]?.toUpperCase()}
                                  </div>
                                </div>
                                <div className="absolute -inset-2 bg-gradient-to-r from-[#9146ff]/40 to-[#772ce8]/40 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden lg:block" />
                                {/* Online indicator */}
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 border-2 border-[#1a1a1a] lg:border-[#0e0e10] rounded-full animate-pulse"></div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-lg lg:text-xl text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#9146ff] group-hover:to-[#772ce8] group-hover:bg-clip-text transition-all duration-300 truncate">
                                  {stream}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="text-[#6b6b6b] lg:text-[#71717a] text-sm font-medium">
                                    Ready to watch
                                  </div>
                                  <div className="w-1 h-1 bg-[#6b6b6b] rounded-full"></div>
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleRemoveStream(index)}
                              className="relative z-10 text-[#6b6b6b] hover:text-[#ef4444] transition-all duration-300 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:scale-110 transform p-2 lg:p-3 rounded-2xl hover:bg-[#ef4444]/10 flex-shrink-0 cursor-pointer hover:cursor-pointer active:cursor-grabbing"
                            >
                              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Modern launch button */}
                  <div className="pt-4 lg:pt-0 mt-4 lg:mt-0">
                    <button
                      onClick={handleStartWatching}
                      disabled={streamList.length === 0 || isLoading}
                      className={`w-full py-6 lg:py-6 bg-gradient-to-r from-[#9146ff] via-[#8b5cf6] to-[#772ce8] hover:from-[#8b5cf6] hover:via-[#7c3aed] hover:to-[#6d28d9] disabled:from-[#2a2a2a] disabled:to-[#343434] lg:disabled:from-[#27272a] lg:disabled:to-[#3f3f46] disabled:cursor-not-allowed rounded-3xl lg:rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-[1.01] lg:hover:scale-105 hover:shadow-2xl hover:shadow-[#9146ff]/50 active:scale-[0.98] disabled:hover:scale-100 text-white transform relative overflow-hidden group cursor-pointer hover:cursor-pointer active:cursor-grabbing shadow-lg shadow-[#9146ff]/30`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 hidden lg:block" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#9146ff]/20 to-[#772ce8]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden lg:block" />
                      
                      <span className="relative z-10 flex items-center justify-center gap-4">
                        {isLoading ? (
                          <>
                            <div className="w-7 h-7 lg:w-8 lg:h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Launching...</span>
                          </>
                        ) : streamList.length === 0 ? (
                          <>
                            <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <span>Add streamers to begin</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            <span>Start Watching ({streamList.length})</span>
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.9;
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0px) rotate(12deg);
          }
          50% {
            transform: translateY(-15px) rotate(12deg);
          }
        }
        
        @keyframes drift {
          0%, 100% {
            transform: translateX(0px) rotate(45deg);
          }
          50% {
            transform: translateX(20px) rotate(45deg);
          }
        }
        
        @keyframes text-shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        
        @keyframes smooth-zoom-out {
          0% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          100% {
            transform: scale(0.95) translateY(-20px);
            opacity: 0;
          }
        }
        
        @keyframes smooth-zoom-in {
          0% {
            transform: scale(1.05) translateY(20px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes dramatic-slide-out {
          0% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateX(-30px) scale(1.02);
            opacity: 0.8;
          }
          100% {
            transform: translateX(-100vw) scale(0.9);
            opacity: 0;
          }
        }
        
        @keyframes dramatic-slide-in {
          0% {
            transform: translateX(100vw) scale(0.9);
            opacity: 0;
          }
          50% {
            transform: translateX(30px) scale(1.02);
            opacity: 0.8;
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-float-gentle {
          animation: float-gentle 6s ease-in-out infinite;
        }
        
        .animate-drift {
          animation: drift 8s ease-in-out infinite;
        }
        
        .animate-text-shimmer {
          background-size: 200% 100%;
          animation: text-shimmer 4s ease-in-out infinite;
        }
        
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        
        .border-3 {
          border-width: 3px;
        }
        
        .animate-smooth-zoom-out {
          animation: smooth-zoom-out 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .animate-smooth-zoom-in {
          animation: smooth-zoom-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        .animate-dramatic-slide-out {
          animation: dramatic-slide-out 0.8s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
        }
        
        .animate-dramatic-slide-in {
          animation: dramatic-slide-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        /* Prevent scrollbars during animations */
        body:has(.animate-smooth-zoom-out),
        body:has(.animate-smooth-zoom-in),
        body:has(.animate-dramatic-slide-out),
        body:has(.animate-dramatic-slide-in) {
          overflow: hidden !important;
        }
        
        html:has(.animate-smooth-zoom-out),
        html:has(.animate-smooth-zoom-in),
        html:has(.animate-dramatic-slide-out),
        html:has(.animate-dramatic-slide-in) {
          overflow: hidden !important;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(63, 63, 70, 0.3);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9146ff, #772ce8);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #8b5cf6, #6d28d9);
        }
        
        /* Global dark scrollbar styling */
        * {
          scrollbar-width: thin;
          scrollbar-color: #9146ff #18181b;
        }
        
        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        *::-webkit-scrollbar-track {
          background: #18181b;
        }
        
        *::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9146ff, #772ce8);
          border-radius: 4px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #8b5cf6, #6d28d9);
        }
        
        *::-webkit-scrollbar-corner {
          background: #18181b;
        }
        
        /* Ensure no horizontal overflow anywhere */
        body, html {
          max-width: 100vw;
          overflow-x: hidden !important;
        }
      `}</style>
    </div>
  );
} 