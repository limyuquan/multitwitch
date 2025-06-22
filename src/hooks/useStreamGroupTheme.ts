import { useState, useEffect, useMemo } from "react";
import type { 
  StreamGroupsConfig, 
  StreamGroup, 
  StreamGroupTheme, 
  ThemeMatchResult 
} from "~/types/stream-groups";
import type { StreamConfig } from "~/app/_components/MultiTwitchViewer";

export function useStreamGroupTheme(streams: StreamConfig[]) {
  const [config, setConfig] = useState<StreamGroupsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Import the JSON configuration
        const configModule = await import("~/config/stream-groups.json");
        const streamGroupsConfig = configModule.default as StreamGroupsConfig;
        
        setConfig(streamGroupsConfig);
      } catch (err) {
        console.error("Failed to load stream groups configuration:", err);
        setError("Failed to load theme configuration");
        
        // Fallback to default theme structure
        setConfig({
          groups: [],
          defaultTheme: {
            name: "default-theme",
            colors: {
              primary: "#8b5cf6",
              secondary: "#a855f7", 
              accent: "#c084fc",
              background: "from-slate-950 via-slate-900 to-indigo-950"
            },
            headerIcon: "stream",
            description: "Default MultiTwitch Theme"
          },
          matchTypes: {
            all: { description: "All members required", minRequired: "100%" },
            multiple: { description: "Multiple members required", minRequired: 2 }
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Calculate which theme should be applied based on current streams
  const themeMatch = useMemo((): ThemeMatchResult => {
    if (!config || streams.length === 0) {
      return {
        matched: false,
        theme: config?.defaultTheme ?? {
          name: "default-theme",
          colors: {
            primary: "#8b5cf6",
            secondary: "#a855f7",
            accent: "#c084fc", 
            background: "from-slate-950 via-slate-900 to-indigo-950"
          },
          headerIcon: "stream",
          description: "Default MultiTwitch Theme"
        }
      };
    }

    const activeStreamUsernames = streams
      .filter(stream => stream.isActive)
      .map(stream => stream.username.toLowerCase());

    // Check each group for matches
    for (const group of config.groups) {
      const groupMembers = group.members.map(member => member.toLowerCase());
      const matchedMembers = activeStreamUsernames.filter(username => 
        groupMembers.includes(username)
      );

      let isMatch = false;

      if (group.matchType === "all") {
        // All group members must be present in active streams
        isMatch = groupMembers.every(member => 
          activeStreamUsernames.includes(member)
        );
      } else if (group.matchType === "multiple") {
        // At least 2 group members must be present
        isMatch = matchedMembers.length >= 2;
      }

      if (isMatch) {
        return {
          matched: true,
          group,
          theme: group.theme,
          matchedMembers
        };
      }
    }

    // No matches found, return default theme
    return {
      matched: false,
      theme: config.defaultTheme
    };
  }, [config, streams]);

  return {
    themeMatch,
    config,
    isLoading,
    error,
    // Helper functions
    getAvailableGroups: () => config?.groups ?? [],
    isGroupActive: (groupId: string) => 
      themeMatch.matched && themeMatch.group?.id === groupId,
  };
} 