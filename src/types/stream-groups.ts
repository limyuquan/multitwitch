export interface StreamGroupTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  headerIcon: string;
  description: string;
  customIcon?: string; // Path to custom icon image
}

export interface StreamGroup {
  id: string;
  name: string;
  description: string;
  members: string[];
  matchType: "all" | "multiple";
  theme: StreamGroupTheme;
}

export interface MatchTypeConfig {
  description: string;
  minRequired: number | string;
}

export interface StreamGroupsConfig {
  groups: StreamGroup[];
  defaultTheme: StreamGroupTheme;
  matchTypes: {
    all: MatchTypeConfig;
    multiple: MatchTypeConfig;
  };
}

export interface ThemeMatchResult {
  matched: boolean;
  group?: StreamGroup;
  theme: StreamGroupTheme;
  matchedMembers?: string[];
} 