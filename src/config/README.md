# Stream Groups Configuration

This system allows you to define groups of streamers and apply custom themes when specific combinations of those streamers are active.

## Configuration File

The configuration is stored in `stream-groups.json` and follows this structure:

### Groups

Each group defines:
- **id**: Unique identifier for the group
- **name**: Display name for the group
- **description**: Brief description of what the group represents
- **members**: Array of Twitch usernames (case-insensitive)
- **matchType**: How to match the group ("all" or "multiple")
- **theme**: Theme configuration to apply when matched

### Match Types

- **"all"**: All members of the group must be present in active streams
- **"multiple"**: At least 2 members of the group must be present in active streams

### Theme Structure

Each theme includes:
- **name**: Unique theme identifier
- **colors**: Color palette with primary, secondary, accent, and background
- **headerIcon**: Icon identifier for the header (used as fallback)
- **description**: Theme description
- **customIcon**: (Optional) Path to custom PNG icon in `/public/theme-icons/`

## Example Configuration

```json
{
  "groups": [
    {
      "id": "my-group",
      "name": "My Streamer Group",
      "description": "A group of my favorite streamers",
      "members": ["streamer1", "streamer2", "streamer3"],
      "matchType": "multiple",
      "theme": {
        "name": "my-theme",
        "colors": {
          "primary": "#ff6b9d",
          "secondary": "#a8e6cf", 
          "accent": "#ffd93d",
          "background": "from-pink-950 via-pink-900 to-green-950"
        },
        "headerIcon": "heart",
        "description": "My Custom Theme",
        "customIcon": "/theme-icons/my-group.png"
      }
    }
  ],
  "defaultTheme": {
    "name": "default-theme",
    "colors": {
      "primary": "#8b5cf6",
      "secondary": "#a855f7",
      "accent": "#c084fc", 
      "background": "from-slate-950 via-slate-900 to-indigo-950"
    },
    "headerIcon": "stream",
    "description": "Default MultiTwitch Theme"
  }
}
```

## Usage

The theme system is automatically integrated into the `MultiTwitchViewer` component. Simply:

1. Edit the `stream-groups.json` file to add your groups
2. The theme will automatically apply when the match conditions are met
3. Use the `useStreamGroupTheme` hook in components to access theme information

## Adding New Groups

1. Add a new group object to the `groups` array in `stream-groups.json`
2. Define the member usernames (must match Twitch usernames exactly, case-insensitive)
3. Choose appropriate colors for the theme
4. Set the match type based on your preferences

## Color Guidelines

- **primary**: Main accent color for buttons and highlights
- **secondary**: Secondary accent color for variations
- **accent**: Additional accent color for special elements
- **background**: Tailwind CSS gradient class for the main background

## Theme Icons

### Custom Icons
- Place PNG images in the `/public/theme-icons/` folder
- Name them after the group ID (e.g., `otv-friends.png`)
- Recommended size: 64x64px or larger (will be automatically scaled)
- Images should be square or they will be letterboxed

### Fallback Icons
Available fallback icons include: `heart`, `fire`, `target`, `gamepad`, `stream`, and others. These SVG icons are used when:
- No `customIcon` is specified
- The custom icon fails to load
- During the loading state of custom icons

## Notes

- Usernames are matched case-insensitively
- Groups are evaluated in order - the first matching group wins
- If no groups match, the default theme is used
- The system gracefully handles missing or invalid configuration files 