"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { StreamConfig } from "./MultiTwitchViewer";
import { TwitchEmbed } from "./TwitchEmbed";
import { QuickStreamActions } from "./QuickStreamActions";

interface DraggableStreamItemProps {
  stream: StreamConfig;
  onRemove?: (stream: StreamConfig) => void;
  canRemove: boolean;
}

export function DraggableStreamItem({ 
  stream,
  onRemove,
  canRemove
}: DraggableStreamItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ 
    id: stream.username,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    willChange: 'transform',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-username={stream.username}
      className={`relative group bg-gray-800 rounded-lg overflow-hidden select-none ${
        isDragging 
          ? "z-50 scale-102 shadow-2xl ring-2 ring-purple-400 bg-gray-700 brightness-110 dragging" 
          : isOver
          ? "ring-2 ring-purple-300 bg-purple-900/10 scale-101"
          : "hover:ring-1 hover:ring-gray-600/30 transform-gpu"
      } transition-all duration-300 ease-out`}
    >
      {/* Drag handles on edges only - not covering the video */}
      <div
        {...attributes}
        {...listeners}
        className={`absolute top-0 left-0 right-0 h-12 z-20 cursor-grab active:cursor-grabbing ${
          isDragging ? 'bg-purple-500/10' : ''
        } transition-colors duration-200`}
        title="Drag to reorder streams"
      />
      
      {/* Left edge drag handle */}
      <div
        {...attributes}
        {...listeners}
        className={`absolute top-12 left-0 w-4 bottom-0 z-20 cursor-grab active:cursor-grabbing ${
          isDragging ? 'bg-purple-500/10' : ''
        } transition-colors duration-200`}
        title="Drag to reorder streams"
      />
      
      {/* Right edge drag handle */}
      <div
        {...attributes}
        {...listeners}
        className={`absolute top-12 right-0 w-4 bottom-0 z-20 cursor-grab active:cursor-grabbing ${
          isDragging ? 'bg-purple-500/10' : ''
        } transition-colors duration-200`}
        title="Drag to reorder streams"
      />

      {/* Subtle drag handles in corners - only visible on longer hover */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-15 opacity-0 group-hover:opacity-60 transition-all duration-500 delay-300 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-gray-300 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="opacity-70">
            <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
          <span className="text-xs">drag</span>
        </div>
      </div>

      {/* Stream label - always visible */}
      <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          {stream.username}
        </div>
      </div>

      {/* Quick Actions */}
      <QuickStreamActions
        stream={stream}
        onRemove={onRemove}
        canRemove={canRemove}
      />

      {/* Performance optimized iframe container */}
      <div className="w-full h-full">
        <TwitchEmbed
          channel={stream.username}
          width="100%"
          height="100%"
          autoplay={true}
          muted={true}
        />
      </div>
    </div>
  );
} 