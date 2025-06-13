"use client";

import { useEffect, useRef } from "react";

interface TwitchEmbedProps {
  channel: string;
  width: string | number;
  height: string | number;
  autoplay?: boolean;
  muted?: boolean;
}

export function TwitchEmbed({ 
  channel, 
  width, 
  height, 
  autoplay = true, 
  muted = false 
}: TwitchEmbedProps) {
  const embedRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Only reload iframe if it's a completely new channel
    if (embedRef.current?.src) {
      const currentChannel = new URL(embedRef.current.src).searchParams.get('channel');
      if (currentChannel !== channel) {
        embedRef.current.src = embedRef.current.src;
      }
    }
  }, [channel]);

  const getParentDomain = () => {
    if (typeof window !== "undefined") {
      return window.location.hostname;
    }
    return "localhost";
  };

  const embedUrl = `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${getParentDomain()}&autoplay=${autoplay}&muted=${muted}`;

  return (
    <iframe
      ref={embedRef}
      src={embedUrl}
      width={width}
      height={height}
      allowFullScreen
      loading="lazy"
      style={{
        border: "none",
        width: typeof width === "string" ? width : `${width}px`,
        height: typeof height === "string" ? height : `${height}px`,
        willChange: "auto",
        contain: "strict",
      }}
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation allow-modals"
      className="w-full h-full transform-gpu"
    />
  );
} 