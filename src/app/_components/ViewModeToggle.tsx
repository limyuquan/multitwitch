"use client";

import type { ViewMode } from "./MultiTwitchViewer";
import { useTheme } from "~/contexts/ThemeContext";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  streamCount: number;
}

export function ViewModeToggle({ viewMode, onViewModeChange, streamCount }: ViewModeToggleProps) {
  const { themeMatch } = useTheme();

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-400">View Mode:</span>
        <div 
          className="flex glass-theme backdrop-blur-sm rounded-xl p-1.5 shadow-lg"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--theme-primary) 8%, #1e293b)',
            borderColor: 'color-mix(in srgb, var(--theme-primary) 25%, transparent)'
          }}
        >
          <button
            onClick={() => onViewModeChange("split")}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer hover:cursor-pointer active:cursor-pointer ${
              viewMode === "split"
                ? "text-white shadow-lg scale-105"
                : "text-slate-300 hover:text-white"
            }`}
            style={{
              background: viewMode === "split" 
                ? `linear-gradient(to right, var(--theme-primary), var(--theme-secondary))`
                : 'transparent',
              boxShadow: viewMode === "split"
                ? `0 10px 25px color-mix(in srgb, var(--theme-primary) 25%, transparent)`
                : 'none'
            }}
            onMouseEnter={(e) => {
              if (viewMode !== "split") {
                e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 10%, transparent)';
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== "split") {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            Split ({streamCount})
          </button>
          <button
            onClick={() => onViewModeChange("single")}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer hover:cursor-pointer active:cursor-pointer ${
              viewMode === "single"
                ? "text-white shadow-lg scale-105"
                : "text-slate-300 hover:text-white"
            }`}
            style={{
              background: viewMode === "single" 
                ? `linear-gradient(to right, var(--theme-primary), var(--theme-secondary))`
                : 'transparent',
              boxShadow: viewMode === "single"
                ? `0 10px 25px color-mix(in srgb, var(--theme-primary) 25%, transparent)`
                : 'none'
            }}
            onMouseEnter={(e) => {
              if (viewMode !== "single") {
                e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 10%, transparent)';
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== "single") {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4V4z" />
            </svg>
            Single
          </button>
        </div>
      </div>
      
      {/* {viewMode === "split" && streamCount > 1 && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="opacity-60">
            <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
          <span>Drag streams to reorder</span>
        </div>
      )} */}
    </div>
  );
} 