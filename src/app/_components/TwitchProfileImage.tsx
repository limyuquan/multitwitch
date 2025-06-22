"use client";

import { useState } from "react";
import Image from "next/image";
import { api } from "~/trpc/react";

interface TwitchProfileImageProps {
  username: string;
  size?: number;
  className?: string;
  showDisplayName?: boolean;
  fallbackSize?: "small" | "medium" | "large";
  showLiveStatus?: boolean;
}

export function TwitchProfileImage({ 
  username, 
  size = 48, 
  className = "",
  showDisplayName = false,
  fallbackSize = "medium",
  showLiveStatus = true
}: TwitchProfileImageProps) {
  const [imageError, setImageError] = useState(false);
  
  const { data: userProfile, isLoading, error } = api.twitch.getUserProfile.useQuery(
    { username: username.toLowerCase() },
    {
      enabled: !!username,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: (failureCount, error) => {
        // Don't retry if user not found
        if (error.message.includes("Failed to fetch user profile")) {
          return failureCount < 2;
        }
        return false;
      },
    }
  );

  const { data: streamStatus } = api.twitch.getStreamStatus.useQuery(
    { username: username.toLowerCase() },
    {
      enabled: !!username && showLiveStatus,
      staleTime: 1 * 60 * 1000, // 1 minute (live status changes frequently)
      gcTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes to keep status fresh
    }
  );

  // Generate fallback avatar with user's initials
  const getFallbackAvatar = () => {
    const initials = username.slice(0, 2).toUpperCase();
    const colors = [
      "from-blue-500 to-purple-500",
      "from-green-500 to-teal-500", 
      "from-purple-500 to-pink-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-blue-500",
      "from-pink-500 to-rose-500",
    ];
    
    // Simple hash based on username for consistent colors
    const colorIndex = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const gradientClass = colors[colorIndex];
    
    return (
      <div 
        className={`relative flex items-center justify-center bg-gradient-to-br ${gradientClass} text-white font-bold rounded-full overflow-hidden ${className}`}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.4 }}>{initials}</span>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div 
        className={`relative bg-gray-700 animate-pulse rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full" />
      </div>
    );
  }

  // Error state or user not found
  if (error || !userProfile || imageError) {
    if (showDisplayName) {
      return (
        <div className="flex items-center gap-3">
          {getFallbackAvatar()}
          <div>
            <div className="font-semibold text-white">{username}</div>
            <div className="text-xs text-gray-400">
              {error && error.message.includes("not found") ? (
                <span className="text-gray-500 font-medium">User not found</span>
              ) : error ? (
                <span className="text-gray-500 font-medium">Failed to load</span>
              ) : showLiveStatus ? (
                <span className="text-gray-500 font-medium text-xs">Offline</span>
              ) : (
                `@${username}`
              )}
            </div>
          </div>
        </div>
      );
    }
    return getFallbackAvatar();
  }

  // Success state with profile image
  const profileContent = (
    <div className="relative">
      <Image
        src={userProfile.profileImageUrl}
        alt={`${userProfile.displayName}'s profile`}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        onError={() => setImageError(true)}
        priority={size > 64} // Priority for larger images
        unoptimized // Twitch images are already optimized
      />
      
      {/* Live indicator - only show when user is actually streaming */}
      {showLiveStatus && streamStatus?.isLive && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 border-2 border-gray-900 rounded-full animate-pulse">
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
        </div>
      )}
    </div>
  );

  if (showDisplayName) {
    return (
      <div className="flex items-center gap-3">
        {profileContent}
        <div>
          <div className="font-semibold text-white">{userProfile.displayName}</div>
                      <div className="text-xs text-gray-400">
              {showLiveStatus && streamStatus?.isLive ? (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-400 font-semibold text-[11px] uppercase tracking-wide">
                      LIVE
                    </span>
                  </div>
                  <span className="text-gray-300 text-xs">•</span>
                  <span className="text-gray-300 font-medium truncate max-w-[120px]" title={streamStatus.streamInfo?.gameName || 'Just Chatting'}>
                    {streamStatus.streamInfo?.gameName || 'Just Chatting'}
                  </span>
                </div>
              ) : showLiveStatus ? (
                <span className="text-gray-500 font-medium text-xs">
                  Offline
                </span>
              ) : (
                `@${userProfile.username}`
              )}
            </div>
        </div>
      </div>
    );
  }

  return profileContent;
}

// Bulk profile images component for efficiency
interface TwitchProfileImagesProps {
  usernames: string[];
  size?: number;
  className?: string;
  maxDisplay?: number;
  showLiveStatus?: boolean;
}

export function TwitchProfileImages({ 
  usernames, 
  size = 32, 
  className = "",
  maxDisplay = 5,
  showLiveStatus = true
}: TwitchProfileImagesProps) {
  const { data: userProfiles, isLoading } = api.twitch.getUserProfiles.useQuery(
    { usernames: usernames.slice(0, maxDisplay) },
    {
      enabled: usernames.length > 0,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }
  );

  const { data: streamStatuses } = api.twitch.getMultipleStreamStatus.useQuery(
    { usernames: usernames.slice(0, maxDisplay) },
    {
      enabled: usernames.length > 0 && showLiveStatus,
      staleTime: 1 * 60 * 1000, // 1 minute
      gcTime: 2 * 60 * 1000,
      refetchInterval: 2 * 60 * 1000,
    }
  );

  if (isLoading) {
    return (
      <div className="flex -space-x-2">
        {Array.from({ length: Math.min(usernames.length, maxDisplay) }).map((_, i) => (
          <div
            key={i}
            className={`relative bg-gray-700 animate-pulse rounded-full border-2 border-gray-900 ${className}`}
            style={{ width: size, height: size }}
          />
        ))}
      </div>
    );
  }

  const remainingCount = usernames.length - maxDisplay;

  // Create a map for quick live status lookup
  const liveStatusMap = new Map(
    streamStatuses?.map(status => [status.username, status.isLive]) || []
  );

  return (
    <div className="flex -space-x-2">
      {userProfiles?.map((profile, index) => {
        const isLive = showLiveStatus && liveStatusMap.get(profile.username);
        
        return (
          <div
            key={profile.username}
            className="relative"
            style={{ zIndex: maxDisplay - index }}
          >
            <Image
              src={profile.profileImageUrl}
              alt={`${profile.displayName}'s profile`}
              width={size}
              height={size}
              className={`rounded-full object-cover border-2 border-gray-900 ${className}`}
              unoptimized
            />
            
            {/* Live indicator for bulk view */}
            {isLive && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 border border-gray-900 rounded-full animate-pulse">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
              </div>
            )}
          </div>
        );
      })}
      
      {remainingCount > 0 && (
        <div
          className={`relative flex items-center justify-center bg-gray-700 text-white text-xs font-bold rounded-full border-2 border-gray-900 ${className}`}
          style={{ width: size, height: size, fontSize: size * 0.3 }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
} 