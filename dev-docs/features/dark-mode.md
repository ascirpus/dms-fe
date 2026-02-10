# Dark Mode

## Overview

The application supports light and dark color themes. The theme preference is persisted across sessions.

## Components

- `src/stores/mainStore.ts` - Persists theme preference
- `src/components/base/Header.vue` - Theme toggle button
- `src/App.vue` - Applies theme on mount

## How It Works

### Theme Detection

On first visit, the app checks the user's system preference:
- If the system prefers dark mode (`prefers-color-scheme: dark`), dark mode is enabled
- Otherwise, light mode is the default

### Theme Switching

- A sun/moon icon toggle button is available in the header
- Clicking it switches between light and dark mode
- The preference is saved to localStorage via the Pinia `mainStore`
- The `html` element gets a `dark` class toggled, which activates dark CSS custom properties

### CSS Custom Properties

The theme is applied via CSS variables defined in `src/style.css`:

**Light mode (default):**
- Background: white/light gray tones
- Text: dark slate
- Borders: light gray

**Dark mode (`html.dark`):**
- Background: dark slate/navy tones
- Text: light/white
- Borders: dark gray

All components use these CSS variables, so the entire UI updates when the theme changes.

## User Interactions

| Action | How | Result |
|--------|-----|--------|
| Toggle theme | Click sun/moon icon in header | Switches between light and dark mode |
| Auto-detect | First visit | System preference applied automatically |

## States

- **Light mode:** White backgrounds, dark text
- **Dark mode:** Dark backgrounds, light text
