"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemeIcon } from "../_components/ThemeIcon";
import streamGroupsConfig from "~/config/stream-groups.json";
import type { StreamGroupsConfig, StreamGroup } from "~/types/stream-groups";

export default function ThemesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  useEffect(() => {
    // Smooth entrance animation with staggered effect
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const config = streamGroupsConfig as StreamGroupsConfig;
  const themes = config.groups;

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white relative overflow-hidden">
      {/* Loading overlay with smooth exit */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#0e0e10] z-50 flex items-center justify-center animate-fade-out">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#9146ff] via-[#8b5cf6] to-[#772ce8] rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
              <svg className="w-8 h-8 text-white animate-spin-slow" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="text-[#a1a1aa] text-sm font-medium animate-pulse">
              Loading themes...
            </div>
          </div>
        </div>
      )}

      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#9146ff]/6 via-[#0e0e10] to-[#772ce8]/6" />
      
      {/* Geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 border border-[#9146ff]/15 rounded-full animate-spin-slow" />
        <div className="absolute bottom-1/4 right-1/6 w-64 h-64 border border-[#772ce8]/15 rotate-45 animate-pulse-slow" />
        <div className="absolute top-3/4 left-1/2 w-48 h-48 border-2 border-[#9146ff]/20 rotate-12 animate-float-gentle" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: `
            linear-gradient(rgba(145, 70, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(145, 70, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className={`relative z-10 transition-all duration-1000 ${isLoading ? 'opacity-0 translate-y-12 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}>
        {/* Header */}
        <div className="bg-[#18181b]/80 backdrop-blur-xl border-b border-[#3f3f46]/40 sticky top-0 z-20 transition-all duration-500">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleGoBack}
                  className="group flex items-center gap-3 text-slate-400 hover:text-white transition-all duration-300 hover:-translate-x-1 hover:scale-105 cursor-pointer hover:bg-[#9146ff]/10 rounded-xl p-2"
                >
                  <div className="p-2 rounded-xl bg-[#27272a] border border-[#3f3f46] group-hover:border-[#9146ff]/50 group-hover:bg-[#9146ff]/10 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#9146ff]/20">
                    <svg className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <span className="font-semibold text-lg">Back to Setup</span>
                </button>
                
                <div className="h-8 w-[1px] bg-[#3f3f46]" />
                
                <div className="animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
                  <h1 className="text-3xl font-black text-transparent bg-gradient-to-r from-white via-[#f8fafc] to-[#e2e8f0] bg-clip-text">
                    Theme Gallery
                  </h1>
                  <p className="text-[#a1a1aa] text-sm font-medium mt-1">
                    Explore all available streamer group themes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 animate-slide-in-left" style={{ animationDelay: '0.4s' }}>
                <div className="bg-[#9146ff]/15 border border-[#9146ff]/30 px-4 py-2 rounded-xl hover:bg-[#9146ff]/20 hover:border-[#9146ff]/50 transition-all duration-300 hover:scale-105">
                  <span className="text-[#9146ff] text-sm font-semibold">{themes.length} Themes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Description */}
          <div className="text-center mb-16 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-2xl font-bold text-white mb-4">
              Automatic Theming System
            </h2>
            <p className="text-[#a1a1aa] text-lg leading-relaxed">
              When you watch streamers from the same group, MultiTwitcher automatically applies their custom theme. 
              Each theme transforms the entire interface with unique colors, gradients, and visual effects.
            </p>
          </div>

          {/* Themes Grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {themes.map((group: StreamGroup, index: number) => (
              <div
                key={group.id}
                className={`group relative bg-gradient-to-br from-[#18181b]/90 via-[#1f1f23]/80 to-[#18181b]/90 backdrop-blur-xl rounded-3xl border border-[#3f3f46]/40 overflow-hidden hover:border-[#9146ff]/50 transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#9146ff]/20 cursor-pointer animate-fade-in-up ${selectedTheme === group.id ? 'ring-2 ring-[#9146ff]/50 scale-[1.02] shadow-2xl shadow-[#9146ff]/30' : ''}`}
                style={{ 
                  animationDelay: `${0.7 + index * 0.1}s`,
                }}
                onClick={() => setSelectedTheme(selectedTheme === group.id ? null : group.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#9146ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Theme Preview Header */}
                <div className="p-8 pb-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <ThemeIcon theme={group.theme} size="lg" className="shadow-xl transform group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute -inset-3 bg-gradient-to-r from-[#9146ff]/40 to-[#772ce8]/40 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#9146ff] group-hover:to-[#772ce8] group-hover:bg-clip-text transition-all duration-300">
                        {group.name}
                      </h3>
                      <p className="text-[#a1a1aa] text-sm font-medium mt-1 group-hover:text-white transition-colors duration-300">
                        {group.description}
                      </p>
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#a1a1aa]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.21-.64-1.67-.08-.09-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-5.51-4.49-10-10-10z"/>
                      </svg>
                      <span>Color Palette</span>
                    </div>
                    
                    <div className="flex gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl shadow-lg border-2 border-white/20 relative group/color"
                        style={{ backgroundColor: group.theme.colors.primary }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/color:opacity-100 transition-opacity whitespace-nowrap">
                          Primary
                        </div>
                      </div>
                      <div 
                        className="w-12 h-12 rounded-xl shadow-lg border-2 border-white/20 relative group/color"
                        style={{ backgroundColor: group.theme.colors.secondary }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/color:opacity-100 transition-opacity whitespace-nowrap">
                          Secondary
                        </div>
                      </div>
                      <div 
                        className="w-12 h-12 rounded-xl shadow-lg border-2 border-white/20 relative group/color"
                        style={{ backgroundColor: group.theme.colors.accent }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/color:opacity-100 transition-opacity whitespace-nowrap">
                          Accent
                        </div>
                      </div>
                      <div 
                        className="flex-1 h-12 rounded-xl shadow-lg border-2 border-white/20 relative group/color"
                        style={{ 
                          background: group.theme.colors.background.includes('from-') 
                            ? `linear-gradient(135deg, ${group.theme.colors.primary}, ${group.theme.colors.secondary})` 
                            : group.theme.colors.background 
                        }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/color:opacity-100 transition-opacity whitespace-nowrap">
                          Gradient
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Members Section */}
                <div className="px-8 pb-8">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#a1a1aa] mb-4">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h3v4h2v-7H7V8.5C7 7.12 8.12 6 9.5 6S12 7.12 12 8.5V9h2V8.5C14 6.01 11.99 4 9.5 4S5 6.01 5 8.5V11H2v7h2z"/>
                    </svg>
                    <span>Group Members ({group.members.length})</span>
                    <div className="text-xs px-2 py-1 bg-[#27272a] rounded-full text-[#71717a]">
                      {group.matchType === 'all' ? 'All required' : 'Multiple (2+)'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {group.members.slice(0, 6).map((member: string) => (
                      <div
                        key={member}
                        className="flex items-center gap-3 p-3 bg-[#0e0e10]/50 rounded-xl border border-[#3f3f46]/30 hover:border-[#9146ff]/30 transition-all duration-300"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9146ff] to-[#772ce8] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                          {member[0]?.toUpperCase()}
                        </div>
                        <span className="text-white text-sm font-medium truncate">
                          {member}
                        </span>
                      </div>
                    ))}
                    {group.members.length > 6 && (
                      <div className="flex items-center justify-center p-3 bg-[#0e0e10]/30 rounded-xl border border-[#3f3f46]/20 text-[#71717a] text-sm">
                        +{group.members.length - 6} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded View */}
                {selectedTheme === group.id && (
                  <div className="border-t border-[#3f3f46]/40 bg-[#0e0e10]/30 p-8 animate-fade-in">
                    <h4 className="text-lg font-bold text-white mb-4">Theme Preview</h4>
                    
                    {/* Mini UI Preview */}
                    <div 
                      className="relative bg-gradient-to-br from-[#18181b] to-[#0e0e10] rounded-2xl p-6 border shadow-2xl"
                      style={{
                        borderColor: group.theme.colors.primary,
                        background: `linear-gradient(135deg, ${group.theme.colors.primary}15, ${group.theme.colors.secondary}15)`,
                      }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                          style={{ backgroundColor: group.theme.colors.primary }}
                        >
                          MT
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-semibold">MultiTwitcher</div>
                          <div className="text-sm text-[#a1a1aa]">Theme: {group.name}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div 
                          className="p-3 rounded-lg border"
                          style={{ 
                            backgroundColor: `${group.theme.colors.primary}10`,
                            borderColor: `${group.theme.colors.primary}30`
                          }}
                        >
                          <div className="text-white text-sm font-medium">Stream 1</div>
                          <div className="text-xs text-[#a1a1aa]">Active</div>
                        </div>
                        <div 
                          className="p-3 rounded-lg border"
                          style={{ 
                            backgroundColor: `${group.theme.colors.secondary}10`,
                            borderColor: `${group.theme.colors.secondary}30`
                          }}
                        >
                          <div className="text-white text-sm font-medium">Stream 2</div>
                          <div className="text-xs text-[#a1a1aa]">Active</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Default Theme */}
          <div className="mt-16 pt-12 border-t border-[#3f3f46]/40">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Default Theme</h3>
            <div className="max-w-2xl mx-auto bg-gradient-to-br from-[#18181b]/90 via-[#1f1f23]/80 to-[#18181b]/90 backdrop-blur-xl rounded-3xl border border-[#3f3f46]/40 p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#8b5cf6] to-[#a855f7] rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" opacity="0.8"/>
                    <path d="M5 5h4v4H5V5zm10 0h4v4h-4V5zM5 15h4v4H5v-4zm10 0h4v4h-4v-4z"/>
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-white">Standard MultiTwitcher</h4>
                <p className="text-[#a1a1aa]">
                  The default purple gradient theme used when no streamer groups are detected. 
                  Clean, modern, and always available.
                </p>
                <div className="flex justify-center gap-3 pt-4">
                  <div className="w-12 h-12 rounded-xl bg-[#8b5cf6] border-2 border-white/20 shadow-lg" />
                  <div className="w-12 h-12 rounded-xl bg-[#a855f7] border-2 border-white/20 shadow-lg" />
                  <div className="w-12 h-12 rounded-xl bg-[#c084fc] border-2 border-white/20 shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
        
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-15px) rotate(12deg); }
        }
        
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-fade-out { animation: fade-out 0.3s ease-out forwards; }
        .animate-fade-in-up { 
          animation: fade-in-up 0.6s ease-out forwards; 
          opacity: 0;
        }
        .animate-slide-in-right { 
          animation: slide-in-right 0.6s ease-out forwards; 
          opacity: 0;
        }
        .animate-slide-in-left { 
          animation: slide-in-left 0.6s ease-out forwards; 
          opacity: 0;
        }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-float-gentle { animation: float-gentle 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
} 