"use client";

import { useState, useRef, useEffect } from "react";
import type { StreamConfig } from "./MultiTwitchViewer";

interface StreamManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  streams: StreamConfig[];
  onStreamsUpdate: (streams: StreamConfig[]) => void;
}

export function StreamManagerModal({ 
  isOpen, 
  onClose, 
  streams, 
  onStreamsUpdate 
}: StreamManagerModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleAddStream = () => {
    const trimmedValue = inputValue.trim().toLowerCase();
    if (!trimmedValue) return;

    // Check if stream already exists
    if (streams.some(stream => stream.username === trimmedValue)) {
      // Show visual feedback for duplicate
      inputRef.current?.classList.add("shake");
      setTimeout(() => {
        inputRef.current?.classList.remove("shake");
      }, 300);
      return;
    }

    setIsSubmitting(true);

    // Add new stream
    const newStream: StreamConfig = {
      username: trimmedValue,
      isActive: true,
    };

    const updatedStreams = [...streams, newStream];
    onStreamsUpdate(updatedStreams);
    
    setInputValue("");
    setIsSubmitting(false);
    
    // Show success feedback
    const successFeedback = document.createElement("div");
    successFeedback.textContent = `✓ ${trimmedValue} added`;
    successFeedback.className = "fixed top-20 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-[100] animate-in slide-in-from-right duration-300";
    document.body.appendChild(successFeedback);
    
    setTimeout(() => {
      successFeedback.remove();
    }, 2000);
  };

  const handleRemoveStream = (streamToRemove: StreamConfig) => {
    const updatedStreams = streams.filter(stream => stream.username !== streamToRemove.username);
    onStreamsUpdate(updatedStreams);
    
    // Show removal feedback
    const removalFeedback = document.createElement("div");
    removalFeedback.textContent = `✓ ${streamToRemove.username} removed`;
    removalFeedback.className = "fixed top-20 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-[100] animate-in slide-in-from-right duration-300";
    document.body.appendChild(removalFeedback);
    
    setTimeout(() => {
      removalFeedback.remove();
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddStream();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Manage Streams</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
            {/* Add Stream Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Add New Stream</h3>
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Twitch username"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder-gray-400 disabled:opacity-50"
                />
                <button
                  onClick={handleAddStream}
                  disabled={!inputValue.trim() || isSubmitting}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors text-white"
                >
                  {isSubmitting ? "Adding..." : "Add"}
                </button>
              </div>
            </div>

            {/* Current Streams */}
            {streams.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  Current Streams ({streams.length})
                </h3>
                <div className="space-y-2">
                  {streams.map((stream) => (
                    <StreamItem
                      key={stream.username}
                      stream={stream}
                      onRemove={handleRemoveStream}
                      canRemove={streams.length > 1}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {streams.length === 0 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📺</div>
                <p className="text-gray-400">No streams added yet</p>
                <p className="text-sm text-gray-500 mt-2">Add a Twitch username above to get started</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 bg-gray-850">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                💡 Tip: You need at least one stream to continue watching
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .shake {
          animation: shake 0.3s ease-in-out;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        
        .zoom-in-95 {
          animation: zoomIn 0.2s ease-out;
        }
        
        .slide-in-from-right {
          animation: slideInFromRight 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

interface StreamItemProps {
  stream: StreamConfig;
  onRemove: (stream: StreamConfig) => void;
  canRemove: boolean;
}

function StreamItem({ stream, onRemove, canRemove }: StreamItemProps) {
  return (
    <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg group hover:bg-gray-650 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
          {stream.username[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-medium text-white">{stream.username}</div>
          <div className="text-sm text-green-400 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Live
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onRemove(stream)}
          disabled={!canRemove}
          className={`p-2 rounded-lg transition-colors ${
            canRemove
              ? 'text-red-400 hover:text-red-300 hover:bg-red-600/10'
              : 'text-gray-500 cursor-not-allowed'
          }`}
          title={canRemove ? 'Remove stream' : 'Cannot remove - at least one stream required'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
} 