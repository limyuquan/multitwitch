"use client";

import { useState, useEffect, useRef, forwardRef } from "react";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  suggestions?: string[];
  maxSuggestions?: number;
}

export const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(
  ({ 
    value, 
    onChange, 
    onKeyPress, 
    onSelect,
    placeholder = "Enter Twitch username", 
    disabled = false,
    className = "",
    suggestions = [],
    maxSuggestions = 5
  }, ref) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
    const [isComposing, setIsComposing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

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

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!showSuggestions || filteredSuggestions.length === 0) {
        onKeyPress?.(e);
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
          } else {
            onKeyPress?.(e);
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
                  <div className="text-[#71717a] text-xs hidden lg:block">
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