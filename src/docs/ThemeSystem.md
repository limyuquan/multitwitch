# Theme System Documentation

The MultiTwitch theme system automatically applies custom themes based on the active streamers. When certain groups of streamers are detected, the application will switch to a themed appearance.

## How It Works

1. **Configuration**: Stream groups are defined in `src/config/stream-groups.json`
2. **Detection**: The `useStreamGroupTheme` hook monitors active streams and matches them against configured groups
3. **Application**: The `ThemeProvider` context applies CSS custom properties that all components can use
4. **Styling**: Components use theme-aware CSS classes and utility functions

## Using Themes in Components

### Basic Theme Usage

```tsx
import { useTheme } from "~/contexts/ThemeContext";

function MyComponent() {
  const { themeMatch } = useTheme();
  
  return (
    <div className="bg-theme-gradient text-white">
      <h1 className="text-theme-primary">
        Current theme: {themeMatch.theme.name}
      </h1>
    </div>
  );
}
```

### Theme Utility Functions

```tsx
import { getThemeButtonClass, getThemeTextClass } from "~/utils/themeUtils";

function MyButton() {
  return (
    <button className={getThemeButtonClass('primary')}>
      <span className={getThemeTextClass('primary')}>
        Theme Button
      </span>
    </button>
  );
}
```

### Available CSS Classes

- **Background**: `bg-theme-gradient`, `bg-theme-primary`, `bg-theme-secondary`, `bg-theme-accent`
- **Text**: `text-theme-primary`, `text-theme-secondary`, `text-theme-accent`
- **Borders**: `border-theme-primary`, `border-theme-secondary`, `border-theme-accent`
- **Buttons**: `btn-theme` (pre-styled gradient button)
- **Glass Effects**: `glass-theme` (theme-aware glass morphism)

### CSS Custom Properties

The following CSS custom properties are available:

- `--theme-primary`: Primary theme color
- `--theme-secondary`: Secondary theme color  
- `--theme-accent`: Accent theme color
- `--theme-background`: Background gradient
- `--theme-name`: Theme name (for conditional styling)

### Advanced Theme Usage

```tsx
function AdvancedComponent() {
  return (
    <div 
      className="p-4 rounded-lg"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
        border: '1px solid color-mix(in srgb, var(--theme-primary) 30%, transparent)'
      }}
    >
      <h2 className="text-theme-primary">Advanced Theme Component</h2>
    </div>
  );
}
```

## Theme Configuration

### Adding New Groups

1. Edit `src/config/stream-groups.json`
2. Add a new group object with:
   - `id`: Unique identifier
   - `name`: Display name
   - `members`: Array of Twitch usernames
   - `matchType`: "all" or "multiple"
   - `theme`: Theme configuration

### Example Group

```json
{
  "id": "my-group",
  "name": "My Streamers",
  "members": ["streamer1", "streamer2"],
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
```

## Theme Components

### ThemeIcon

Displays theme-specific icons with fallback support:

```tsx
import { ThemeIcon } from "~/app/_components/ThemeIcon";

<ThemeIcon 
  theme={themeMatch.theme} 
  size="md"
  className="shadow-lg"
/>
```

Available sizes: `"sm"`, `"md"`, `"lg"`

### ThemeIndicator

Shows when a theme is active:

```tsx
import { ThemeIndicator } from "~/app/_components/ThemeIndicator";

<ThemeIndicator />
```

### ThemeProvider

Wrap your components to provide theme context:

```tsx
import { ThemeProvider } from "~/contexts/ThemeContext";

<ThemeProvider themeMatch={themeMatch} isLoading={false} error={null}>
  <YourComponent />
</ThemeProvider>
```

## Best Practices

1. **Use theme classes**: Prefer `bg-theme-primary` over hardcoded colors
2. **Fallback gracefully**: Always provide fallbacks for when themes aren't loaded
3. **Test all themes**: Ensure your components work with all configured themes
4. **Performance**: Theme changes are optimized with CSS custom properties
5. **Accessibility**: Ensure sufficient contrast in all themes
6. **Icon optimization**: Use optimized PNG images (64x64px recommended) for fast loading
7. **Icon fallbacks**: Always specify a `headerIcon` fallback for when custom icons fail

## Performance Notes

- Themes use CSS custom properties for optimal performance
- Theme switching is immediate with no re-rendering
- Components using theme classes automatically update when themes change
- The system gracefully degrades if theme configuration fails to load 