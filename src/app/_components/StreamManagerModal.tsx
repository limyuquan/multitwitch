"use client";

import { useState, useRef, useEffect } from "react";
import type { StreamConfig } from "./MultiTwitchViewer";
import { AutocompleteInput } from "./AutocompleteInput";
import { TwitchProfileImage } from "./TwitchProfileImage";
import { api } from "~/trpc/react";
import { showToast } from "./ModernToast";

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
  const [previouslyWatchedSuggestions, setPreviouslyWatchedSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // localStorage utilities - same as StreamSetup
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

  const addToPreviouslyWatched = (streamerUsername: string) => {
    const current = loadPreviouslyWatched();
    const uniqueStreamers = [...new Set([streamerUsername, ...current])];
    const limited = uniqueStreamers.slice(0, 12); // Limit to 12 most recent
    savePreviouslyWatched(limited);
  };

  // Load previously watched suggestions when modal opens, excluding current streams
  useEffect(() => {
    if (isOpen) {
      const loaded = loadPreviouslyWatched();
      // Filter out streamers that are already in the current streams
      const currentStreamUsernames = streams.map(stream => stream.username.toLowerCase());
      const filtered = loaded.filter(streamer => 
        !currentStreamUsernames.includes(streamer.toLowerCase())
      );
      setPreviouslyWatchedSuggestions(filtered);
      
      // Focus input
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, streams]);

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

  const addStreamByValue = (value: string) => {
    const trimmedValue = value.trim().toLowerCase();
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
    
    // Save to previously watched
    addToPreviouslyWatched(trimmedValue);
    
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

  const handleValidationResult = (username: string, isValid: boolean) => {
    if (!isValid) {
      showToast(`User "${username}" not found on Twitch`, "error", 4000);
    }
  };

  const utils = api.useUtils();

  const handleAddStream = async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;
    
    // Validate user exists before adding
    try {
      const result = await utils.twitch.validateUser.fetch({ username: trimmedValue.toLowerCase() });
      
      if (result?.exists) {
        addStreamByValue(trimmedValue);
      } else {
        handleValidationResult(trimmedValue, false);
      }
    } catch (error) {
      console.error('Error validating user:', error);
      handleValidationResult(trimmedValue, false);
    }
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-4">
        <div className="w-full h-full lg:w-full lg:max-w-2xl lg:h-auto lg:max-h-[80vh] bg-gray-800 lg:rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-700 bg-gray-800/95 backdrop-blur-sm">
            <h2 className="text-xl lg:text-2xl font-bold text-white">Manage Streams</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 -mr-2 rounded-lg hover:bg-gray-700/50"
            >
              <svg className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto bg-gray-850">
            {/* Add Stream Section */}
            <div className="mb-6 lg:mb-8">
              <h3 className="text-base lg:text-lg font-semibold text-white mb-3 lg:mb-4">Add New Stream</h3>
              <div className="flex flex-col lg:flex-row gap-3 w-full">
                <AutocompleteInput
                  ref={inputRef}
                  value={inputValue}
                  onChange={setInputValue}
                  onKeyPress={handleKeyPress}
                  onSelect={addStreamByValue}
                  onValidationResult={handleValidationResult}
                  placeholder="Enter Twitch username"
                  disabled={isSubmitting}
                  suggestions={previouslyWatchedSuggestions}
                  maxSuggestions={5}
                  showEnhancedSuggestions={true}
                  className="w-full lg:flex-1 px-4 py-3 lg:py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder-gray-400 disabled:opacity-50 text-base lg:text-sm"
                />
                <button
                  onClick={handleAddStream}
                  disabled={!inputValue.trim() || isSubmitting}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors text-white min-h-[48px] lg:min-h-auto"
                >
                  {isSubmitting ? "Adding..." : "Add"}
                </button>
              </div>
            </div>

            {/* Current Streams */}
            {streams.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base lg:text-lg font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  Current Streams ({streams.length})
                </h3>
                <div className="space-y-3 lg:space-y-2">
                  {streams.map((stream) => (
                    <StreamItem
                      key={stream.username}
                      stream={stream}
                      onRemove={handleRemoveStream}
                      canRemove={streams.length > 1}
                      isMobile={typeof window !== 'undefined' && window.innerWidth < 1024}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {streams.length === 0 && (
              <div className="text-center py-12 lg:py-8">
                <div className="text-6xl mb-4">📺</div>
                <p className="text-gray-400 text-base lg:text-sm">No streams added yet</p>
                <p className="text-sm text-gray-500 mt-2">Add a Twitch username above to get started</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 lg:p-6 border-t border-gray-700 bg-gray-850">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-0">
              <div className="text-sm text-gray-400 text-center lg:text-left">
                💡 Tip: You need at least one stream to continue watching
              </div>
              <button
                onClick={onClose}
                className="w-full lg:w-auto px-6 py-3 lg:px-4 lg:py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors text-white min-h-[48px] lg:min-h-auto"
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
  isMobile?: boolean;
}



function StreamItem({ stream, onRemove, canRemove, isMobile = false }: StreamItemProps) {
  return (
    <div className={`flex items-center justify-between bg-gray-700 rounded-lg group hover:bg-gray-650 transition-colors ${
      isMobile ? 'p-4' : 'p-4'
    }`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Twitch Profile Image with Live Status */}
        <TwitchProfileImage 
          username={stream.username}
          size={isMobile ? 48 : 40}
          showDisplayName={true}
          showLiveStatus={true}
          className="flex-shrink-0"
        />
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onRemove(stream)}
          disabled={!canRemove}
          className={`${isMobile ? 'p-3' : 'p-2'} rounded-lg transition-colors cursor-pointer hover:cursor-pointer active:cursor-pointer ${
            canRemove
              ? 'text-red-400 hover:text-red-300 hover:bg-red-600/10'
              : 'text-gray-500 cursor-not-allowed'
          }`}
          title={canRemove ? 'Remove stream' : 'Cannot remove - at least one stream required'}
        >
          <svg width={isMobile ? "20" : "16"} height={isMobile ? "20" : "16"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
} 