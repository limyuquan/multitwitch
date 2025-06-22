"use client";

import { useCallback, useRef, useState } from "react";

interface ResizableSeparatorProps {
  onResize: (deltaX: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export function ResizableSeparator({ 
  onResize, 
  onResizeStart,
  onResizeEnd,
  orientation = "vertical",
  className = "" 
}: ResizableSeparatorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const lastPositionRef = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    onResizeStart?.();
    lastPositionRef.current = orientation === "vertical" ? e.clientX : e.clientY;

    // Create a global overlay to capture all mouse events during drag
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999;
      cursor: ${orientation === "vertical" ? "col-resize" : "row-resize"};
      background: transparent;
    `;
    document.body.appendChild(overlay);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentPosition = orientation === "vertical" ? moveEvent.clientX : moveEvent.clientY;
      const deltaX = currentPosition - lastPositionRef.current;
      
      if (Math.abs(deltaX) > 0) {
        onResize(deltaX);
        lastPositionRef.current = currentPosition;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onResizeEnd?.();
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      
      // Remove the overlay
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      
      // Add satisfying snap effect
      if (navigator.vibrate) {
        navigator.vibrate([5]);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [onResize, onResizeStart, onResizeEnd, orientation]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    onResizeStart?.();
    const touch = e.touches[0];
    if (!touch) return;
    
    lastPositionRef.current = orientation === "vertical" ? touch.clientX : touch.clientY;

    // Create a global overlay to capture all touch events during drag
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999;
      cursor: ${orientation === "vertical" ? "col-resize" : "row-resize"};
      background: transparent;
      touch-action: none;
    `;
    document.body.appendChild(overlay);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      moveEvent.preventDefault();
      const touch = moveEvent.touches[0];
      if (!touch) return;
      
      const currentPosition = orientation === "vertical" ? touch.clientX : touch.clientY;
      const deltaX = currentPosition - lastPositionRef.current;
      
      if (Math.abs(deltaX) > 0) {
        onResize(deltaX);
        lastPositionRef.current = currentPosition;
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      onResizeEnd?.();
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      
      // Remove the overlay
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      
      // Add satisfying snap effect
      if (navigator.vibrate) {
        navigator.vibrate([5]);
      }
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  }, [onResize, onResizeStart, onResizeEnd, orientation]);

  if (orientation === "vertical") {
    return (
      <div
        className={`relative group flex items-center justify-center cursor-col-resize select-none z-30 ${className}`}
        style={{ width: "8px", height: "100%" }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Large invisible hit area that extends into adjacent streams */}
        <div className="absolute inset-0 -mx-2"/>
        
        {/* Visual separator */}
        <div 
          className={`w-1 h-full transition-all duration-300 ${
            isDragging 
              ? "bg-gradient-to-b from-violet-300/30 via-violet-400/80 to-violet-300/30 w-1.5 shadow-lg shadow-violet-400/50" 
              : isHovered
              ? "bg-gradient-to-b from-blue-300/30 via-blue-400/60 to-blue-300/30 w-1.5"
              : "bg-gradient-to-b from-transparent via-slate-600/40 to-transparent"
          }`}
        />
        
        {/* Drag indicator dots */}
        <div 
          className={`absolute inset-0 flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
            isHovered || isDragging ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className={`w-1 h-1 rounded-full transition-all duration-300 ${
            isDragging ? "bg-violet-400" : "bg-slate-400"
          }`} />
          <div className={`w-1 h-1 rounded-full transition-all duration-300 ${
            isDragging ? "bg-violet-400" : "bg-slate-400"
          }`} />
          <div className={`w-1 h-1 rounded-full transition-all duration-300 ${
            isDragging ? "bg-violet-400" : "bg-slate-400"
          }`} />
        </div>
        
        {/* Hover glow effect */}
        {(isHovered || isDragging) && (
          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-violet-400/10 to-transparent transition-all duration-300 ${
            isDragging ? "via-violet-400/20" : ""
          }`} />
        )}
      </div>
    );
  }

  // Horizontal separator (for future use if needed)
  return (
    <div
      className={`relative group flex items-center justify-center cursor-row-resize select-none z-30 ${className}`}
      style={{ width: "100%", height: "8px" }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
          >
        {/* Large invisible hit area that extends into adjacent streams */}
        <div className="absolute inset-0 -my-20" style={{ top: "-80px", bottom: "-80px" }} />
      
      {/* Visual separator */}
      <div 
        className={`h-1 w-full bg-gradient-to-r from-transparent via-slate-600/40 to-transparent transition-all duration-300 ${
          isDragging 
            ? "bg-gradient-to-r from-transparent via-violet-400/80 to-transparent h-1.5 shadow-lg shadow-violet-400/50" 
            : isHovered
            ? "bg-gradient-to-r from-transparent via-slate-400/60 to-transparent h-1.5"
            : "bg-gradient-to-r from-transparent via-slate-600/40 to-transparent"
        }`}
      />
      
      {/* Drag indicator dots */}
      <div 
        className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-300 ${
          isHovered || isDragging ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className={`w-1 h-1 rounded-full transition-all duration-300 ${
          isDragging ? "bg-violet-400" : "bg-slate-400"
        }`} />
        <div className={`w-1 h-1 rounded-full transition-all duration-300 ${
          isDragging ? "bg-violet-400" : "bg-slate-400"
        }`} />
        <div className={`w-1 h-1 rounded-full transition-all duration-300 ${
          isDragging ? "bg-violet-400" : "bg-slate-400"
        }`} />
      </div>
      
      {/* Hover glow effect */}
      {(isHovered || isDragging) && (
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-violet-400/10 to-transparent transition-all duration-300 ${
          isDragging ? "via-violet-400/20" : ""
        }`} />
      )}
    </div>
  );
} 