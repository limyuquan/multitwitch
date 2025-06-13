"use client";

import { useState, useEffect } from "react";
import type { StreamConfig } from "./MultiTwitchViewer";

interface StreamSetupProps {
  onStreamsSetup: (streams: StreamConfig[]) => void;
}

export function StreamSetup({ onStreamsSetup }: StreamSetupProps) {
  const [inputValue, setInputValue] = useState("");
  const [streamList, setStreamList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Hide scrollbars during animation and on mount
  useEffect(() => {
    // Hide scrollbars immediately on mount
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Cleanup on unmount - restore scrollbars
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Additional effect for loading state
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
  }, [isLoading]);

  const handleAddStream = () => {
    const trimmedValue = inputValue.trim().toLowerCase();
    if (trimmedValue && !streamList.includes(trimmedValue)) {
      setStreamList([...streamList, trimmedValue]);
      setInputValue("");
    }
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

  return (
    <div 
      className={`min-h-screen bg-[#0e0e10] text-white relative ${isLoading ? 'animate-smooth-zoom-out' : 'animate-smooth-zoom-in'}`} 
      style={{ 
        overflow: 'hidden',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0
      }}
    >
      {/* New Geometric Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#9146ff]/6 via-[#0e0e10] to-[#772ce8]/6" />
      
      {/* Geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-[#9146ff]/20 rounded-full animate-spin-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 border border-[#772ce8]/15 rotate-45 animate-pulse-slow" />
        <div className="absolute top-3/4 left-1/2 w-32 h-32 border-2 border-[#9146ff]/25 rotate-12 animate-float-gentle" />
        <div className="absolute top-1/6 right-1/3 w-24 h-24 bg-gradient-to-br from-[#9146ff]/10 to-[#772ce8]/10 rounded-lg rotate-45 animate-drift" />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: `
            linear-gradient(rgba(145, 70, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(145, 70, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Hero Section */}
          <div className="space-y-8 relative">
            {/* Floating logo with enhanced effects */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#9146ff]/20 via-[#772ce8]/20 to-[#9146ff]/20 rounded-full blur-3xl animate-pulse-glow" />
              <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#9146ff] via-[#8b5cf6] to-[#772ce8] rounded-3xl shadow-2xl shadow-[#9146ff]/50 transform hover:scale-110 hover:rotate-6 transition-all duration-700 group cursor-grab hover:cursor-grabbing">
                <div className="absolute inset-0 bg-gradient-to-br from-[#9146ff] to-[#772ce8] rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-700" />
                <div className="absolute inset-2 bg-gradient-to-br from-[#a855f7] to-[#7c3aed] rounded-2xl opacity-50" />
                {/* Custom Multi-Stream Icon */}
                <svg className="w-12 h-12 text-white relative z-10 transform group-hover:scale-125 transition-transform duration-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" opacity="0.7"/>
                  <path d="M5 5h4v4H5V5zm10 0h4v4h-4V5zM5 15h4v4H5v-4zm10 0h4v4h-4v-4z"/>
                  <circle cx="7" cy="7" r="1" fill="white"/>
                  <circle cx="17" cy="7" r="1" fill="white"/>
                  <circle cx="7" cy="17" r="1" fill="white"/>
                  <circle cx="17" cy="17" r="1" fill="white"/>
                </svg>
                <div className="absolute -inset-6 bg-gradient-to-r from-[#9146ff]/30 via-transparent to-[#772ce8]/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
            </div>

            {/* Enhanced hero text */}
            <div className="space-y-6">
              <div className="relative">
                <h1 className="text-6xl lg:text-7xl font-black text-transparent bg-gradient-to-r from-white via-[#f8fafc] to-[#e2e8f0] bg-clip-text leading-tight animate-text-shimmer">
                  Multi<span className="text-transparent bg-gradient-to-r from-[#9146ff] via-[#8b5cf6] to-[#772ce8] bg-clip-text animate-text-shimmer animation-delay-500">Twitch</span>
                </h1>
                <div className="absolute -inset-4 bg-gradient-to-r from-[#9146ff]/10 via-transparent to-[#772ce8]/10 blur-xl opacity-50 animate-pulse-slow" />
              </div>
              
              <p className="text-2xl lg:text-3xl text-[#a1a1aa] font-medium leading-relaxed">
                Experience the <span className="text-transparent bg-gradient-to-r from-[#9146ff] to-[#772ce8] bg-clip-text font-semibold">ultimate</span> multi-stream viewing platform
              </p>
              
              <div className="flex items-center gap-4 text-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#22c55e] rounded-full animate-ping" />
                  <div className="w-3 h-3 bg-[#22c55e] rounded-full absolute" />
                  <span className="text-[#22c55e] font-semibold">Live</span>
                </div>
                <div className="text-[#71717a]">•</div>
                <span className="text-[#a1a1aa]">Seamless stream viewing experience</span>
              </div>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8">
              {[
                { icon: "👥", title: "Multi-View", desc: "Watch multiple streams" },
                { icon: "💬", title: "Live Chat", desc: "Interactive chat experience" },
                { icon: "⚡", title: "Real-time", desc: "Instant streaming updates" },
                { icon: "🎮", title: "Gaming", desc: "Perfect for tournaments" }
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
          </div>

          {/* Right Side - Enhanced Interactive Form */}
          <div className="relative">
            {/* Form container with enhanced styling */}
            <div className={`relative bg-gradient-to-br from-[#18181b]/90 via-[#1f1f23]/80 to-[#18181b]/90 backdrop-blur-xl rounded-3xl border border-[#3f3f46]/60 p-8 lg:p-10 shadow-2xl shadow-black/50 hover:shadow-[#9146ff]/20 transition-all duration-700 ${isLoading ? 'animate-dramatic-slide-out' : 'animate-dramatic-slide-in'}`}>
              
              {/* Animated border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#9146ff]/20 via-[#772ce8]/20 to-[#9146ff]/20 opacity-0 hover:opacity-100 transition-opacity duration-700 blur-sm" />
              <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-[#18181b] to-[#1f1f23]" />
              
              <div className="relative z-10">
                {/* Form header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#9146ff] to-[#772ce8] rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Setup Streams</h2>
                    <p className="text-[#a1a1aa] text-sm">Add your favorite streamers</p>
                  </div>
                </div>

                {/* Enhanced input section */}
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-1 relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#9146ff]/20 to-[#772ce8]/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter streamer username..."
                        className="relative w-full px-6 py-5 bg-[#0e0e10] border border-[#3f3f46]/60 rounded-2xl text-white placeholder-[#71717a] focus:outline-none focus:border-[#9146ff] focus:ring-4 focus:ring-[#9146ff]/20 transition-all duration-300 text-lg font-medium hover:border-[#52525b] group-hover:shadow-lg group-hover:shadow-[#9146ff]/10 cursor-text"
                      />
                    </div>
                    
                    <button
                      onClick={handleAddStream}
                      disabled={!inputValue.trim()}
                      className="px-8 py-5 bg-gradient-to-r from-[#9146ff] via-[#8b5cf6] to-[#772ce8] hover:from-[#8b5cf6] hover:via-[#7c3aed] hover:to-[#6d28d9] disabled:from-[#27272a] disabled:to-[#3f3f46] disabled:cursor-not-allowed rounded-2xl font-semibold text-lg transition-all duration-500 hover:scale-110 hover:shadow-xl hover:shadow-[#9146ff]/40 active:scale-95 disabled:hover:scale-100 text-white transform relative overflow-hidden group cursor-pointer hover:cursor-pointer active:cursor-grabbing"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative flex items-center gap-3">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                        Add
                      </span>
                    </button>
                  </div>

                  {/* Enhanced stream list */}
                  {streamList.length > 0 && (
                    <div className="space-y-4 max-h-80 overflow-y-auto overflow-x-hidden custom-scrollbar">
                      {streamList.map((stream, index) => (
                        <div
                          key={stream}
                          className="group relative flex items-center justify-between bg-gradient-to-r from-[#0e0e10] via-[#18181b] to-[#0e0e10] border border-[#3f3f46]/40 px-6 py-5 rounded-2xl hover:border-[#9146ff]/60 hover:shadow-xl hover:shadow-[#9146ff]/25 transition-all duration-500 animate-slide-in transform hover:scale-[1.02] min-w-0 cursor-default"
                          style={{ animationDelay: `${index * 150}ms` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-[#9146ff]/5 to-[#772ce8]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          
                          <div className="flex items-center gap-5 relative z-10 min-w-0 flex-1">
                            <div className="relative flex-shrink-0">
                              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xl transform group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-[#9146ff] via-[#8b5cf6] to-[#772ce8] flex items-center justify-center">
                                <div className="w-full h-full flex items-center justify-center text-xl font-black text-white">
                                  {stream[0]?.toUpperCase()}
                                </div>
                              </div>
                              <div className="absolute -inset-2 bg-gradient-to-r from-[#9146ff]/40 to-[#772ce8]/40 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-xl text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#9146ff] group-hover:to-[#772ce8] group-hover:bg-clip-text transition-all duration-300 truncate">
                                {stream}
                              </div>
                              <div className="text-[#71717a] text-sm font-medium">
                                Ready to stream
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveStream(index)}
                            className="relative z-10 text-[#71717a] hover:text-[#ef4444] transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-125 transform p-3 rounded-xl hover:bg-[#ef4444]/10 flex-shrink-0 cursor-pointer hover:cursor-pointer active:cursor-grabbing"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Epic start button */}
                  <button
                    onClick={handleStartWatching}
                    disabled={streamList.length === 0 || isLoading}
                    className={`w-full py-6 bg-gradient-to-r from-[#9146ff] via-[#8b5cf6] to-[#772ce8] hover:from-[#8b5cf6] hover:via-[#7c3aed] hover:to-[#6d28d9] disabled:from-[#27272a] disabled:to-[#3f3f46] disabled:cursor-not-allowed rounded-2xl font-semibold text-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#9146ff]/50 active:scale-95 disabled:hover:scale-100 text-white transform relative overflow-hidden group cursor-pointer hover:cursor-pointer active:cursor-grabbing`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#9146ff]/20 to-[#772ce8]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <span className="relative z-10 flex items-center justify-center gap-4">
                      {isLoading ? (
                        <>
                          <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Launching Experience...</span>
                        </>
                      ) : streamList.length === 0 ? (
                        <>
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          <span>Add streamers to begin</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          <span>Launch MultiTwitch ({streamList.length})</span>
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
      `}</style>
    </div>
  );
} 