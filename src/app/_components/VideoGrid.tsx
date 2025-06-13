"use client";

import { useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import type { StreamConfig, ViewMode } from "./MultiTwitchViewer";
import { TwitchEmbed } from "./TwitchEmbed";
import { DraggableStreamItem } from "./DraggableStreamItem";

interface VideoGridProps {
  streams: StreamConfig[];
  viewMode: ViewMode;
  activeStreamIndex: number;
  onActiveStreamChange: (index: number) => void;
  onStreamReorder: (newStreams: StreamConfig[]) => void;
  onStreamRemove?: (stream: StreamConfig) => void;
}

export function VideoGrid({ 
  streams, 
  viewMode, 
  activeStreamIndex, 
  onActiveStreamChange,
  onStreamReorder,
  onStreamRemove
}: VideoGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = streams.findIndex((stream) => stream.username === active.id);
      const newIndex = streams.findIndex((stream) => stream.username === over.id);
      
      const newStreams = arrayMove(streams, oldIndex, newIndex);
      onStreamReorder(newStreams);
      
      // Add satisfying snap effect
      if (navigator.vibrate) {
        navigator.vibrate([15, 10, 15]);
      }
      
      // Trigger snap animation on the moved item
      setTimeout(() => {
        const movedElement = gridRef.current?.querySelector(`[data-username="${active.id}"]`);
        if (movedElement) {
          movedElement.classList.add('snap-animation');
          setTimeout(() => {
            movedElement.classList.remove('snap-animation');
          }, 200);
        }
      }, 50);
    }
  }

  // Calculate grid layout for split view
  const getGridLayout = (count: number) => {
    if (count === 1) return "grid-cols-1 grid-rows-1";
    if (count === 2) return "grid-cols-2 grid-rows-1";
    if (count === 3) return "grid-cols-2 grid-rows-2";
    if (count === 4) return "grid-cols-2 grid-rows-2";
    if (count <= 6) return "grid-cols-3 grid-rows-2";
    if (count <= 9) return "grid-cols-3 grid-rows-3";
    return "grid-cols-4 grid-rows-3";
  };

  if (streams.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-400 text-lg">No streams configured</p>
      </div>
    );
  }

  if (viewMode === "single") {
    return (
      <div className="h-full flex flex-col pt-2">
        {/* Single stream view */}
        <div className="flex-1 relative overflow-hidden">
          {streams.map((stream, index) => (
            <div
              key={stream.username}
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                index === activeStreamIndex 
                  ? "opacity-100 scale-100" 
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <TwitchEmbed
                channel={stream.username}
                width="100%"
                height="100%"
                autoplay={index === activeStreamIndex}
                muted={false}
              />
            </div>
          ))}
        </div>
        
        {/* Stream selector for single mode - moved to bottom */}
        {streams.length > 1 && (
          <div className="bg-slate-950/90 backdrop-blur-xl border-t border-slate-700/40 shadow-2xl">
            <div className="p-4 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {streams.map((stream, index) => (
                  <button
                    key={stream.username}
                    onClick={() => onActiveStreamChange(index)}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap shadow-lg backdrop-blur-sm border flex-shrink-0 ${
                      index === activeStreamIndex
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white border-violet-500/50 shadow-violet-500/25 scale-105"
                        : "bg-slate-800/70 text-slate-300 border-slate-700/50 hover:bg-slate-700/80 hover:text-white hover:border-slate-600/60 hover:scale-105"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className={`w-2 h-2 rounded-full ${
                          index === activeStreamIndex 
                            ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' 
                            : 'bg-slate-500'
                        }`}></div>
                        {index === activeStreamIndex && (
                          <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-60"></div>
                        )}
                      </div>
                      <span>{stream.username}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Bottom status bar */}
            <div className="px-4 py-2 border-t border-slate-700/30 bg-slate-950/60">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">Single View Mode</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{activeStreamIndex + 1} of {streams.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Split view
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={() => {
        // Add haptic feedback on supported devices
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      }}
    >
      <SortableContext 
        items={streams.map(stream => stream.username)} 
        strategy={rectSortingStrategy}
      >
        <div 
          ref={gridRef}
          className={`h-full grid gap-2 p-2 ${getGridLayout(streams.length)}`}
          style={{
            contain: 'layout style paint',
            willChange: 'auto',
          }}
        >
          {streams.map((stream) => (
            <DraggableStreamItem
              key={stream.username}
              stream={stream}
              onRemove={onStreamRemove}
              canRemove={streams.length > 1}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
} 