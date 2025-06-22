"use client";

import React, { useRef, useState, useCallback } from "react";
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
import { ResizableSeparator } from "./ResizableSeparator";
import { useTheme } from "~/contexts/ThemeContext";

interface VideoGridProps {
  streams: StreamConfig[];
  viewMode: ViewMode;
  activeStreamIndex: number;
  onActiveStreamChange: (index: number) => void;
  onStreamReorder: (newStreams: StreamConfig[]) => void;
  onStreamRemove?: (stream: StreamConfig) => void;
  isMobile?: boolean;
}

export function VideoGrid({ 
  streams, 
  viewMode, 
  activeStreamIndex, 
  onActiveStreamChange,
  onStreamReorder,
  onStreamRemove,
  isMobile = false
}: VideoGridProps) {
  const { themeMatch } = useTheme();
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Helper function to get number of columns for grid layout
  const getGridCols = (count: number) => {
    if (count <= 2) return count;
    if (count <= 4) return 2;
    if (count <= 9) return 3;
    return 4;
  };
  
  // Initialize individual stream widths
  const [streamWidths, setStreamWidths] = useState<Record<string, number>>(() => {
    const initialWidths: Record<string, number> = {};
    const cols = getGridCols(streams.length);
    const equalWidth = 100 / cols; // Equal width within each row
    streams.forEach(stream => {
      initialWidths[stream.username] = equalWidth;
    });
    return initialWidths;
  });
  
  // Track if we're currently dragging to disable transitions
  const [isDragging, setIsDragging] = useState(false);

  // Update stream widths when streams change
  React.useEffect(() => {
    const cols = getGridCols(streams.length);
    const equalWidth = 100 / cols;
    
    setStreamWidths(prev => {
      const newWidths: Record<string, number> = {};
      
      // Check if we need to recalculate all widths
      const existingStreamNames = Object.keys(prev);
      const prevStreamCount = existingStreamNames.length;
      const prevCols = prevStreamCount > 0 ? getGridCols(prevStreamCount) : 0;
      const shouldRecalculateAll = cols !== prevCols;
      
      streams.forEach(stream => {
        if (shouldRecalculateAll) {
          // Grid layout changed - recalculate all widths equally
          newWidths[stream.username] = equalWidth;
        } else {
          // Grid layout unchanged - keep existing widths, use equal width for new streams
          newWidths[stream.username] = prev[stream.username] ?? equalWidth;
        }
      });
      
      return newWidths;
    });
  }, [streams]);

  const handleStreamResize = useCallback((leftStreamUsername: string, rightStreamUsername: string, deltaX: number) => {
    // Use a ref to get the latest container width without causing re-renders
    const containerWidth = gridRef.current?.offsetWidth || 1000;
    const deltaPercentage = (deltaX / containerWidth) * 100;

    // Use functional update for optimal performance
    setStreamWidths(prev => {
      const leftCurrentWidth = prev[leftStreamUsername] || 0;
      const rightCurrentWidth = prev[rightStreamUsername] || 0;

      // Calculate new widths with constraints
      const minWidth = 15;
      const maxWidth = 85;
      
      let newLeftWidth = leftCurrentWidth + deltaPercentage;
      let newRightWidth = rightCurrentWidth - deltaPercentage;
      
      // Apply constraints efficiently
      if (newLeftWidth < minWidth) {
        const overflow = minWidth - newLeftWidth;
        newLeftWidth = minWidth;
        newRightWidth -= overflow;
      } else if (newLeftWidth > maxWidth) {
        const overflow = newLeftWidth - maxWidth;
        newLeftWidth = maxWidth;
        newRightWidth += overflow;
      }
      
      if (newRightWidth < minWidth) {
        const overflow = minWidth - newRightWidth;
        newRightWidth = minWidth;
        newLeftWidth -= overflow;
      } else if (newRightWidth > maxWidth) {
        const overflow = newRightWidth - maxWidth;
        newRightWidth = maxWidth;
        newLeftWidth += overflow;
      }
      
      // Apply final constraints and only update if valid
      if (newLeftWidth >= minWidth && newLeftWidth <= maxWidth && 
          newRightWidth >= minWidth && newRightWidth <= maxWidth &&
          Math.abs(newLeftWidth - leftCurrentWidth) > 0.01) { // Avoid unnecessary updates
        return {
          ...prev,
          [leftStreamUsername]: newLeftWidth,
          [rightStreamUsername]: newRightWidth,
        };
      }

      return prev; // No change needed
    });
  }, []);

  const handleStreamResizeWithAutoFill = useCallback((streamUsername: string, deltaX: number) => {
    // Use a ref to get the latest container width without causing re-renders
    const containerWidth = gridRef.current?.offsetWidth || 1000;
    const deltaPercentage = (deltaX / containerWidth) * 100;

    // Use functional update for optimal performance
    setStreamWidths(prev => {
      const currentWidth = prev[streamUsername] || 0;

      // Calculate new width with constraints
      const minWidth = 15;
      const maxWidth = 75; // Allow more space since the right panel will auto-fill
      
      let newWidth = currentWidth + deltaPercentage;
      
      // Apply constraints
      newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
      
      // Only update if there's a meaningful change
      if (Math.abs(newWidth - currentWidth) > 0.01) {
        return {
          ...prev,
          [streamUsername]: newWidth,
        };
      }

      return prev; // No change needed
    });
  }, []);

  const handleResizeStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleResizeEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  
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

  // Calculate grid layout classes
  const getGridLayout = (count: number) => {
    if (count === 1) return "grid-cols-1 grid-rows-1";
    if (count === 2) return "grid-cols-2 grid-rows-1";
    if (count === 3) return "grid-cols-2 grid-rows-2";
    if (count === 4) return "grid-cols-2 grid-rows-2";
    if (count <= 6) return "grid-cols-3 grid-rows-2";
    if (count <= 9) return "grid-cols-3 grid-rows-3";
    return "grid-cols-4 grid-rows-3";
  };

  // Helper function to organize streams into rows
  const organizeStreamsIntoRows = () => {
    const cols = getGridCols(streams.length);
    const rows: StreamConfig[][] = [];
    
    for (let i = 0; i < streams.length; i += cols) {
      rows.push(streams.slice(i, i + cols));
    }
    
    return rows;
  };

  if (streams.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-400 text-lg">No streams configured</p>
      </div>
    );
  }

  // Mobile layout: Always single stream with navigation
  if (isMobile || viewMode === "single") {
    return (
      <div 
        className="h-full flex flex-col"
        style={{
          background: 'var(--theme-background)',
          backgroundColor: 'color-mix(in srgb, var(--theme-primary) 3%, #0f172a)'
        }}
      >
        {/* Single stream view */}
        <div 
          className="flex-1 relative overflow-hidden m-2 rounded-xl glass-theme shadow-2xl"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, #1e293b)',
            borderColor: 'color-mix(in srgb, var(--theme-primary) 20%, transparent)',
            boxShadow: `0 25px 50px color-mix(in srgb, var(--theme-primary) 10%, transparent)`
          }}
        >
          {streams.map((stream, index) => {
            const isActiveStream = index === activeStreamIndex;
            
            return (
              <div
                key={stream.username}
                className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                  isActiveStream
                    ? "opacity-100 scale-100" 
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
                style={{ 
                  visibility: isActiveStream ? 'visible' : 'hidden',
                  zIndex: isActiveStream ? 10 : 0
                }}
              >
                <TwitchEmbed
                  channel={stream.username}
                  width="100%"
                  height="100%"
                  autoplay={false}
                  muted={false}
                />
              </div>
            );
          })}

          {/* Mobile Navigation Controls */}
          {isMobile && streams.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={() => {
                  const newIndex = activeStreamIndex === 0 ? streams.length - 1 : activeStreamIndex - 1;
                  onActiveStreamChange(newIndex);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-50 w-10 h-10 glass-theme backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg cursor-pointer hover:cursor-pointer active:cursor-pointer"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--theme-primary) 15%, #000000)',
                  borderColor: 'color-mix(in srgb, var(--theme-primary) 30%, transparent)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 25%, #000000)';
                  e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-primary) 50%, transparent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 15%, #000000)';
                  e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-primary) 30%, transparent)';
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Next Button */}
              <button
                onClick={() => {
                  const newIndex = activeStreamIndex === streams.length - 1 ? 0 : activeStreamIndex + 1;
                  console.log("newIndex", newIndex);
                  onActiveStreamChange(newIndex);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-100 w-10 h-10 glass-theme backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg cursor-pointer hover:cursor-pointer active:cursor-pointer"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--theme-primary) 15%, #000000)',
                  borderColor: 'color-mix(in srgb, var(--theme-primary) 30%, transparent)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 25%, #000000)';
                  e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-primary) 50%, transparent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 15%, #000000)';
                  e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-primary) 30%, transparent)';
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Stream Indicator */}
              <div 
                className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 glass-theme backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--theme-primary) 12%, #000000)',
                  borderColor: 'color-mix(in srgb, var(--theme-primary) 25%, transparent)',
                  boxShadow: `0 10px 25px color-mix(in srgb, var(--theme-primary) 15%, transparent)`
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor: 'var(--theme-accent)',
                    boxShadow: `0 0 10px color-mix(in srgb, var(--theme-accent) 60%, transparent)`
                  }}
                ></div>
                <span className="text-white text-sm font-medium">{streams[activeStreamIndex]?.username}</span>
                <span className="text-slate-300 text-xs">({activeStreamIndex + 1}/{streams.length})</span>
              </div>
            </>
          )}
        </div>
        
        {/* Desktop stream selector - only show on desktop */}
        {!isMobile && streams.length > 1 && (
          <div 
            className="glass-theme backdrop-blur-xl border-t shadow-2xl"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, #0f172a)',
              borderColor: 'color-mix(in srgb, var(--theme-primary) 20%, transparent)'
            }}
          >
            <div className="p-4 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {streams.map((stream, index) => (
                  <button
                    key={stream.username}
                    onClick={() => onActiveStreamChange(index)}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap shadow-lg backdrop-blur-sm glass-theme flex-shrink-0 cursor-pointer hover:cursor-pointer active:cursor-pointer ${
                      index === activeStreamIndex
                        ? "text-white scale-105"
                        : "text-slate-300 hover:text-white hover:scale-105"
                    }`}
                    style={{
                      background: index === activeStreamIndex
                        ? `linear-gradient(to right, var(--theme-primary), var(--theme-secondary))`
                        : 'color-mix(in srgb, var(--theme-primary) 8%, #1e293b)',
                      borderColor: index === activeStreamIndex
                        ? 'color-mix(in srgb, var(--theme-primary) 50%, transparent)'
                        : 'color-mix(in srgb, var(--theme-primary) 20%, transparent)',
                      boxShadow: index === activeStreamIndex
                        ? `0 10px 25px color-mix(in srgb, var(--theme-primary) 25%, transparent)`
                        : `0 4px 10px color-mix(in srgb, var(--theme-primary) 10%, transparent)`
                    }}
                    onMouseEnter={(e) => {
                      if (index !== activeStreamIndex) {
                        e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 12%, #1e293b)';
                        e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-primary) 30%, transparent)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (index !== activeStreamIndex) {
                        e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary) 8%, #1e293b)';
                        e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--theme-primary) 20%, transparent)';
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: index === activeStreamIndex 
                              ? 'var(--theme-accent)'
                              : '#64748b',
                            boxShadow: index === activeStreamIndex
                              ? `0 0 10px color-mix(in srgb, var(--theme-accent) 60%, transparent)`
                              : 'none'
                          }}
                        ></div>
                        {index === activeStreamIndex && (
                          <div 
                            className="absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-60"
                            style={{
                              backgroundColor: 'var(--theme-accent)'
                            }}
                          ></div>
                        )}
                      </div>
                      <span>{stream.username}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Bottom status bar */}
            <div 
              className="px-4 py-2 border-t"
              style={{
                borderColor: 'color-mix(in srgb, var(--theme-primary) 15%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--theme-primary) 3%, #0f172a)'
              }}
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{
                      backgroundColor: 'var(--theme-primary)'
                    }}
                  ></div>
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

  // Desktop split view with resizable individual streams
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
          className="h-full flex flex-col p-2 gap-2"
          style={{
            contain: 'layout style paint',
            willChange: 'auto',
          }}
        >
          {organizeStreamsIntoRows().map((rowStreams, rowIndex) => (
            <div 
              key={`row-${rowIndex}`}
              className="flex flex-1 relative gap-0"
              style={{ minHeight: 0 }}
            >
              {rowStreams.map((stream, streamIndex) => {
                const isLastInRow = streamIndex === rowStreams.length - 1;
                const streamWidth = streamWidths[stream.username] || (100 / rowStreams.length);
                
                return (
                  <React.Fragment key={stream.username}>
                    <div
                      className={`relative ${isLastInRow ? 'flex-1' : 'flex-shrink-0'} ${isDragging ? 'no-transition' : 'resizable-stream'}`}
                      style={{ 
                        width: isLastInRow ? undefined : `${streamWidth}%`,
                        height: '100%',
                        transition: isDragging ? 'none' : undefined,
                      }}
                    >
                      <DraggableStreamItem
                        stream={stream}
                        onRemove={onStreamRemove}
                        canRemove={streams.length > 1}
                      />
                    </div>
                    
                    {/* Add separator between streams in the same row (except before the last stream) */}
                    {streamIndex < rowStreams.length - 1 && (
                      <div className="relative z-30 flex-shrink-0" style={{ width: '8px' }}>
                        <ResizableSeparator
                          onResize={(deltaX) => {
                            // If this is the separator before the last stream, 
                            // only resize the left stream (right stream will auto-adjust)
                            const leftStream = stream.username;
                            const rightStream = rowStreams[streamIndex + 1]!.username;
                            const isRightStreamLast = streamIndex + 1 === rowStreams.length - 1;
                            
                            if (isRightStreamLast) {
                              // Only resize the left stream, right stream auto-fills
                              handleStreamResizeWithAutoFill(leftStream, deltaX);
                            } else {
                              // Normal resize between two fixed-width streams
                              handleStreamResize(leftStream, rightStream, deltaX);
                            }
                          }}
                          onResizeStart={handleResizeStart}
                          onResizeEnd={handleResizeEnd}
                          orientation="vertical"
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
} 