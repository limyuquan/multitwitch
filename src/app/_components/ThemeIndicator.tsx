"use client";

import { useTheme } from "~/contexts/ThemeContext";
import { ThemeIcon } from "./ThemeIcon";

export function ThemeIndicator() {
  const { themeMatch } = useTheme();

  if (!themeMatch.matched || !themeMatch.group) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-md glass-theme text-xs">
      {/* Theme icon based on group configuration */}
      <div className="flex-shrink-0">
        <ThemeIcon 
          theme={themeMatch.theme} 
          size="sm"
          className="opacity-80"
        />
      </div>
      <span className="text-slate-300 font-medium truncate">
        {themeMatch.group.name}
      </span>
      {themeMatch.matchedMembers && themeMatch.matchedMembers.length > 0 && (
        <span className="text-slate-400 text-xs">
          ({themeMatch.matchedMembers.length} matched)
        </span>
      )}
    </div>
  );
} 