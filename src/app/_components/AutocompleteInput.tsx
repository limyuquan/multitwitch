"use client";

import { useState, useEffect, useRef, forwardRef, useCallback } from "react";
import { api } from "~/trpc/react";
import Image from "next/image";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  onSelect?: (value: string) => void;
  onValidationResult?: (username: string, isValid: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  suggestions?: string[];
  maxSuggestions?: number;
  showEnhancedSuggestions?: boolean;
}

interface EnhancedSuggestion {
  username: string;
  exists: boolean;
  profileImageUrl: string | null;
  displayName: string | null;
  isLive: boolean;
  streamInfo: {
    gameName: string;
    viewerCount: number;
    title: string;
  } | null;
}

// Custom hook for debounced API calls
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(
  ({ 
    value, 
    onChange, 
    onKeyPress, 
    onSelect,
    onValidationResult,
    placeholder = "Enter Twitch username", 
    disabled = false,
    className = "",
    suggestions = [],
    maxSuggestions = 5,
    showEnhancedSuggestions = true
  }, ref) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
    const [isComposing, setIsComposing] = useState(false);
    const [enhancedSuggestions, setEnhancedSuggestions] = useState<EnhancedSuggestion[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounce the input value to reduce API calls
    const debouncedValue = useDebounce(value, 500);

    // User validation query utility
    const utils = api.useUtils();

    // Enhanced suggestions query - only call when we have filtered suggestions
    const { data: enhancedData, isLoading: isEnhancedLoading } = api.twitch.getUsersWithStatus.useQuery(
      { usernames: filteredSuggestions.slice(0, maxSuggestions) },
      {
        enabled: showEnhancedSuggestions && filteredSuggestions.length > 0 && showSuggestions,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
      }
    );

    // Update enhanced suggestions when data changes
    useEffect(() => {
      if (enhancedData && showEnhancedSuggestions) {
        setEnhancedSuggestions(enhancedData);
      }
    }, [enhancedData, showEnhancedSuggestions]);

    // Filter suggestions based on input value
    useEffect(() => {
      if (value.length > 0 && !isComposing) {
        const filtered = suggestions
          .filter(suggestion => 
            suggestion.toLowerCase().includes(value.toLowerCase()) &&
            suggestion.toLowerCase() !== value.toLowerCase()
          )
          .slice(0, maxSuggestions);
        
        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setActiveSuggestionIndex(-1);
      } else {
        setShowSuggestions(false);
        setFilteredSuggestions([]);
        setActiveSuggestionIndex(-1);
        setEnhancedSuggestions([]);
      }
    }, [value, suggestions, maxSuggestions, isComposing]);

    // Handle click outside to close suggestions
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setShowSuggestions(false);
          setActiveSuggestionIndex(-1);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Validate user when Enter is pressed
    const handleUserValidation = useCallback(async (username: string) => {
      try {
        const result = await utils.twitch.validateUser.fetch({ username: username.toLowerCase() });
        onValidationResult?.(username, result.exists);
        return result.exists;
      } catch (error) {
        console.error('Error validating user:', error);
        onValidationResult?.(username, false);
        return false;
      }
    }, [utils, onValidationResult]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!showSuggestions || filteredSuggestions.length === 0) {
        if (e.key === 'Enter') {
          // Validate user before calling onKeyPress
          e.preventDefault();
          if (value.trim()) {
            handleUserValidation(value.trim()).then((isValid) => {
              if (isValid) {
                // Create a new event object with the same properties
                const newEvent = {
                  ...e,
                  key: 'Enter',
                  preventDefault: () => {},
                } as React.KeyboardEvent;
                onKeyPress?.(newEvent);
              }
            });
          }
        } else {
          onKeyPress?.(e);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveSuggestionIndex(prev => 
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveSuggestionIndex(prev => 
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (activeSuggestionIndex >= 0 && activeSuggestionIndex < filteredSuggestions.length) {
            const selectedSuggestion = filteredSuggestions[activeSuggestionIndex];
            if (selectedSuggestion) {
              onChange(selectedSuggestion);
              onSelect?.(selectedSuggestion);
            }
            setShowSuggestions(false);
            setActiveSuggestionIndex(-1);
          } else if (value.trim()) {
            // Validate and add if user exists
            handleUserValidation(value.trim()).then((isValid) => {
              if (isValid) {
                const newEvent = {
                  ...e,
                  key: 'Enter',
                  preventDefault: () => {},
                } as React.KeyboardEvent;
                onKeyPress?.(newEvent);
              }
            });
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          setActiveSuggestionIndex(-1);
          break;
        case 'Tab':
          if (activeSuggestionIndex >= 0) {
            e.preventDefault();
            const selectedSuggestion = filteredSuggestions[activeSuggestionIndex];
            if (selectedSuggestion) {
              onChange(selectedSuggestion);
              onSelect?.(selectedSuggestion);
            }
            setShowSuggestions(false);
            setActiveSuggestionIndex(-1);
          }
          break;
        default:
          onKeyPress?.(e);
          break;
      }
    };

    const handleSuggestionClick = (suggestion: string) => {
      onChange(suggestion);
      onSelect?.(suggestion);
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    const handleCompositionStart = () => {
      setIsComposing(true);
    };

    const handleCompositionEnd = () => {
      setIsComposing(false);
    };

    const renderSuggestionContent = (suggestion: string, index: number) => {
      if (!showEnhancedSuggestions) {
        // Fallback to simple suggestions
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 lg:w-7 lg:h-7 rounded-xl lg:rounded-lg bg-gradient-to-br from-[#9146ff] to-[#772ce8] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {suggestion[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-base lg:text-sm truncate">
                {suggestion}
              </div>
              <div className="text-xs text-[#a1a1aa] font-medium">
                Previously watched
              </div>
            </div>
          </div>
        );
      }

      const enhanced = enhancedSuggestions.find(s => s.username === suggestion);
      
      if (isEnhancedLoading || !enhanced) {
        // Loading state
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 lg:w-7 lg:h-7 rounded-xl lg:rounded-lg bg-gray-600 animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-base lg:text-sm truncate">
                {suggestion}
              </div>
              <div className="text-xs text-[#a1a1aa] font-medium">
                Loading...
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-3">
          {/* Profile Image */}
          <div className="relative flex-shrink-0">
            {enhanced.profileImageUrl ? (
              <Image
                src={enhanced.profileImageUrl}
                alt={`${enhanced.displayName}'s profile`}
                width={32}
                height={32}
                className="w-8 h-8 lg:w-7 lg:h-7 rounded-xl lg:rounded-lg object-cover"
                unoptimized
              />
            ) : (
              <div className="w-8 h-8 lg:w-7 lg:h-7 rounded-xl lg:rounded-lg bg-gradient-to-br from-[#9146ff] to-[#772ce8] flex items-center justify-center text-sm font-bold text-white">
                {suggestion[0]?.toUpperCase()}
              </div>
            )}
            
            {/* Live indicator */}
            {enhanced.isLive && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 border border-gray-900 rounded-full">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
              </div>
            )}
          </div>
          
          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-base lg:text-sm truncate">
              {enhanced.displayName || suggestion}
            </div>
            <div className="text-xs text-[#a1a1aa] font-medium">
              {enhanced.isLive ? (
                <div className="flex items-center gap-1">
                  <span className="text-red-400 font-semibold">LIVE</span>
                  {enhanced.streamInfo?.gameName && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[100px]" title={enhanced.streamInfo.gameName}>
                        {enhanced.streamInfo.gameName}
                      </span>
                    </>
                  )}
                </div>
              ) : (
                "Offline"
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div ref={containerRef} className="relative flex-1">
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
          autoComplete="off"
        />
        

        
        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] lg:bg-[#18181b] border border-[#2a2a2a] lg:border-[#3f3f46] rounded-2xl lg:rounded-xl shadow-xl shadow-black/50 z-50 overflow-hidden backdrop-blur-sm">
            <div className="py-2">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-3 lg:px-4 lg:py-2.5 text-left transition-all duration-200 flex items-center gap-3 ${
                    index === activeSuggestionIndex
                      ? 'bg-gradient-to-r from-[#9146ff]/20 to-[#772ce8]/20 text-white border-l-2 border-[#9146ff]'
                      : 'text-[#e5e5e5] hover:bg-[#2a2a2a] lg:hover:bg-[#27272a] hover:text-white'
                  }`}
                >
                  {renderSuggestionContent(suggestion, index)}
                  <div className="text-[#71717a] text-xs hidden lg:block flex-shrink-0">
                    ↵
                  </div>
                </button>
              ))}
            </div>
            
            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-[#2a2a2a] lg:border-[#3f3f46] bg-[#151515] lg:bg-[#0e0e10]">
              <div className="text-xs text-[#71717a] flex items-center justify-between">
                <span>Use ↑↓ to navigate</span>
                <span className="hidden lg:inline">↵ to select • ⎋ to close</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

AutocompleteInput.displayName = "AutocompleteInput"; 