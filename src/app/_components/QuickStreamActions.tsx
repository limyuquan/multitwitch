"use client";

import type { StreamConfig } from "./MultiTwitchViewer";

interface QuickStreamActionsProps {
  stream: StreamConfig;
  onRemove?: (stream: StreamConfig) => void;
  canRemove: boolean;
}

export function QuickStreamActions({ 
  stream, 
  onRemove, 
  canRemove
}: QuickStreamActionsProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove && canRemove) {
      onRemove(stream);
    }
  };

  return (
    <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {/* Remove button - only visible on hover */}
      <button
        onClick={handleRemove}
        disabled={!canRemove}
        className={`bg-black/70 backdrop-blur-sm hover:bg-red-600/80 rounded-full p-2 transition-all duration-200 ${
          canRemove 
            ? 'text-white hover:text-white' 
            : 'text-gray-500 cursor-not-allowed opacity-50'
        }`}
        title={canRemove ? 'Remove stream' : 'Cannot remove - at least one stream required'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2" />
        </svg>
      </button>
    </div>
  );
} 