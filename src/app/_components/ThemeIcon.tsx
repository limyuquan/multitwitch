"use client";

import { useState } from "react";
import Image from "next/image";
import type { StreamGroupTheme } from "~/types/stream-groups";

interface ThemeIconProps {
  theme: StreamGroupTheme;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ThemeIcon({ theme, size = "md", className = "" }: ThemeIconProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Size mappings
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6 lg:w-8 lg:h-8", 
    lg: "w-10 h-10 lg:w-12 lg:h-12"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3 h-3 lg:w-5 lg:h-5",
    lg: "w-6 h-6 lg:w-8 lg:h-8"
  };

  // SVG fallback icons based on headerIcon
  const getSvgIcon = (iconName: string) => {
    switch (iconName) {
      case "heart":
        return (
          <svg className={`${iconSizes[size]} text-white`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        );
      case "fire":
        return (
          <svg className={`${iconSizes[size]} text-white`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2c1.64 0 3 1.36 3 3v6c0 1.64-1.36 3-3 3s-3-1.36-3-3V5c0-1.64 1.36-3 3-3zm0 16c3.31 0 6-2.69 6-6v-2h2c1.1 0 2-.9 2-2s-.9-2-2-2h-2V5c0-2.76-2.24-5-5-5S8 2.24 8 5v1H6c-1.1 0-2 .9-2 2s.9 2 2 2h2v2c0 3.31 2.69 6 6 6z" />
          </svg>
        );
      case "target":
        return (
          <svg className={`${iconSizes[size]} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            <circle cx="12" cy="12" r="6" strokeWidth="2"/>
            <circle cx="12" cy="12" r="2" strokeWidth="2"/>
          </svg>
        );
      case "gamepad":
        return (
          <svg className={`${iconSizes[size]} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 00-2 2v3a1 1 0 01-1 1H9a1 1 0 01-1-1v-3a2 2 0 00-2-2H5a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
          </svg>
        );
      default:
        return (
          <svg className={`${iconSizes[size]} text-white`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" opacity="0.7"/>
            <path d="M5 5h4v4H5V5zm10 0h4v4h-4V5zM5 15h4v4H5v-4zm10 0h4v4h-4v-4z"/>
            <circle cx="7" cy="7" r="1" fill="white"/>
            <circle cx="17" cy="7" r="1" fill="white"/>
            <circle cx="7" cy="17" r="1" fill="white"/>
            <circle cx="17" cy="17" r="1" fill="white"/>
          </svg>
        );
    }
  };

  // If we have a custom icon and it hasn't errored, try to load it
  if (theme.customIcon && !imageError) {
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-lg flex items-center justify-center overflow-hidden`}>
        <Image
          src={theme.customIcon}
          alt={`${theme.name} icon`}
          width={size === "sm" ? 16 : size === "md" ? 32 : 48}
          height={size === "sm" ? 16 : size === "md" ? 32 : 48}
          className="w-full h-full object-contain"
          onError={() => setImageError(true)}
          onLoadingComplete={() => setIsLoading(false)}
          priority={false}
        />
        {/* Loading state overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            {getSvgIcon(theme.headerIcon)}
          </div>
        )}
      </div>
    );
  }

  // Fallback to SVG icon
  return (
    <div className={`${sizeClasses[size]} ${className} rounded-lg flex items-center justify-center`}>
      {getSvgIcon(theme.headerIcon)}
    </div>
  );
} 