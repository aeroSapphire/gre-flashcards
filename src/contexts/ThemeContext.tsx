import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Theme {
  name: string;
  id: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    border: string;
    // Orb colors for animated background
    orb1: string;
    orb2: string;
    orb3: string;
  };
}

export const themes: Theme[] = [
  {
    name: 'Midnight',
    id: 'midnight',
    colors: {
      background: '222 47% 11%',
      foreground: '210 40% 98%',
      card: '222 47% 13%',
      cardForeground: '210 40% 98%',
      primary: '172 66% 50%',
      primaryForeground: '222 47% 11%',
      secondary: '217 33% 17%',
      secondaryForeground: '210 40% 98%',
      muted: '217 33% 17%',
      mutedForeground: '215 20% 65%',
      accent: '38 92% 50%',
      border: '217 33% 20%',
      orb1: '#2dd4bf',
      orb2: '#f59e0b',
      orb3: '#6366f1',
    },
  },
  {
    name: 'Dracula',
    id: 'dracula',
    colors: {
      background: '231 15% 18%',
      foreground: '60 30% 96%',
      card: '232 14% 21%',
      cardForeground: '60 30% 96%',
      primary: '265 89% 78%',
      primaryForeground: '231 15% 18%',
      secondary: '232 14% 25%',
      secondaryForeground: '60 30% 96%',
      muted: '232 14% 25%',
      mutedForeground: '60 10% 70%',
      accent: '135 94% 65%',
      border: '232 14% 28%',
      orb1: '#bd93f9',
      orb2: '#ff79c6',
      orb3: '#50fa7b',
    },
  },
  {
    name: 'Nord',
    id: 'nord',
    colors: {
      background: '220 16% 22%',
      foreground: '218 27% 94%',
      card: '220 16% 26%',
      cardForeground: '218 27% 94%',
      primary: '193 43% 67%',
      primaryForeground: '220 16% 22%',
      secondary: '220 16% 30%',
      secondaryForeground: '218 27% 94%',
      muted: '220 16% 30%',
      mutedForeground: '219 28% 70%',
      accent: '311 20% 63%',
      border: '220 16% 32%',
      orb1: '#88c0d0',
      orb2: '#bf616a',
      orb3: '#b48ead',
    },
  },
  {
    name: 'Monokai',
    id: 'monokai',
    colors: {
      background: '70 8% 15%',
      foreground: '60 30% 96%',
      card: '70 8% 18%',
      cardForeground: '60 30% 96%',
      primary: '80 76% 53%',
      primaryForeground: '70 8% 15%',
      secondary: '70 8% 22%',
      secondaryForeground: '60 30% 96%',
      muted: '70 8% 22%',
      mutedForeground: '60 10% 70%',
      accent: '338 95% 56%',
      border: '70 8% 25%',
      orb1: '#a6e22e',
      orb2: '#f92672',
      orb3: '#66d9ef',
    },
  },
  {
    name: 'Gruvbox',
    id: 'gruvbox',
    colors: {
      background: '0 0% 16%',
      foreground: '47 69% 85%',
      card: '0 0% 19%',
      cardForeground: '47 69% 85%',
      primary: '27 99% 55%',
      primaryForeground: '0 0% 16%',
      secondary: '0 0% 23%',
      secondaryForeground: '47 69% 85%',
      muted: '0 0% 23%',
      mutedForeground: '47 30% 65%',
      accent: '61 66% 44%',
      border: '0 0% 26%',
      orb1: '#fe8019',
      orb2: '#b8bb26',
      orb3: '#83a598',
    },
  },
  {
    name: 'Tokyo Night',
    id: 'tokyo-night',
    colors: {
      background: '235 21% 13%',
      foreground: '224 71% 90%',
      card: '235 21% 16%',
      cardForeground: '224 71% 90%',
      primary: '217 92% 76%',
      primaryForeground: '235 21% 13%',
      secondary: '235 21% 20%',
      secondaryForeground: '224 71% 90%',
      muted: '235 21% 20%',
      mutedForeground: '224 30% 65%',
      accent: '328 100% 74%',
      border: '235 21% 23%',
      orb1: '#7aa2f7',
      orb2: '#bb9af7',
      orb3: '#f7768e',
    },
  },
  {
    name: 'Catppuccin',
    id: 'catppuccin',
    colors: {
      background: '240 21% 15%',
      foreground: '226 64% 88%',
      card: '240 21% 18%',
      cardForeground: '226 64% 88%',
      primary: '267 84% 81%',
      primaryForeground: '240 21% 15%',
      secondary: '240 21% 22%',
      secondaryForeground: '226 64% 88%',
      muted: '240 21% 22%',
      mutedForeground: '227 35% 65%',
      accent: '343 81% 75%',
      border: '240 21% 25%',
      orb1: '#cba6f7',
      orb2: '#f38ba8',
      orb3: '#89b4fa',
    },
  },
  {
    name: 'Solarized',
    id: 'solarized',
    colors: {
      background: '192 100% 11%',
      foreground: '186 8% 55%',
      card: '192 81% 14%',
      cardForeground: '186 8% 55%',
      primary: '175 59% 40%',
      primaryForeground: '192 100% 11%',
      secondary: '192 81% 18%',
      secondaryForeground: '186 8% 55%',
      muted: '192 81% 18%',
      mutedForeground: '186 8% 45%',
      accent: '18 89% 55%',
      border: '192 81% 20%',
      orb1: '#2aa198',
      orb2: '#cb4b16',
      orb3: '#268bd2',
    },
  },
  {
    name: 'Rose Pine',
    id: 'rose-pine',
    colors: {
      background: '249 22% 12%',
      foreground: '245 50% 91%',
      card: '249 22% 15%',
      cardForeground: '245 50% 91%',
      primary: '2 55% 83%',
      primaryForeground: '249 22% 12%',
      secondary: '249 22% 19%',
      secondaryForeground: '245 50% 91%',
      muted: '249 22% 19%',
      mutedForeground: '249 12% 60%',
      accent: '189 43% 73%',
      border: '249 22% 22%',
      orb1: '#ebbcba',
      orb2: '#c4a7e7',
      orb3: '#9ccfd8',
    },
  },
  {
    name: 'Cyberpunk',
    id: 'cyberpunk',
    colors: {
      background: '270 50% 8%',
      foreground: '180 100% 90%',
      card: '270 50% 11%',
      cardForeground: '180 100% 90%',
      primary: '318 100% 50%',
      primaryForeground: '270 50% 8%',
      secondary: '270 50% 15%',
      secondaryForeground: '180 100% 90%',
      muted: '270 50% 15%',
      mutedForeground: '180 50% 60%',
      accent: '180 100% 50%',
      border: '270 50% 18%',
      orb1: '#ff00ff',
      orb2: '#00ffff',
      orb3: '#ffff00',
    },
  },
  {
    name: 'Forest',
    id: 'forest',
    colors: {
      background: '150 20% 10%',
      foreground: '120 20% 90%',
      card: '150 20% 13%',
      cardForeground: '120 20% 90%',
      primary: '142 76% 36%',
      primaryForeground: '150 20% 10%',
      secondary: '150 20% 17%',
      secondaryForeground: '120 20% 90%',
      muted: '150 20% 17%',
      mutedForeground: '120 10% 60%',
      accent: '84 81% 44%',
      border: '150 20% 20%',
      orb1: '#22c55e',
      orb2: '#84cc16',
      orb3: '#14b8a6',
    },
  },
  {
    name: 'Ocean',
    id: 'ocean',
    colors: {
      background: '210 50% 10%',
      foreground: '200 30% 90%',
      card: '210 50% 13%',
      cardForeground: '200 30% 90%',
      primary: '199 89% 48%',
      primaryForeground: '210 50% 10%',
      secondary: '210 50% 17%',
      secondaryForeground: '200 30% 90%',
      muted: '210 50% 17%',
      mutedForeground: '200 20% 60%',
      accent: '172 66% 50%',
      border: '210 50% 20%',
      orb1: '#0ea5e9',
      orb2: '#06b6d4',
      orb3: '#3b82f6',
    },
  },
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeId: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedThemeId = localStorage.getItem('app-theme');
    return themes.find(t => t.id === savedThemeId) || themes[0];
  });

  const setTheme = (themeId: string) => {
    const newTheme = themes.find(t => t.id === themeId);
    if (newTheme) {
      setThemeState(newTheme);
      localStorage.setItem('app-theme', themeId);
    }
  };

  // Apply theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const { colors } = theme;

    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--foreground', colors.foreground);
    root.style.setProperty('--card', colors.card);
    root.style.setProperty('--card-foreground', colors.cardForeground);
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-foreground', colors.primaryForeground);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
    root.style.setProperty('--muted', colors.muted);
    root.style.setProperty('--muted-foreground', colors.mutedForeground);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--border', colors.border);
    root.style.setProperty('--input', colors.border);
    root.style.setProperty('--ring', colors.primary);

    // Orb colors
    root.style.setProperty('--orb-1', colors.orb1);
    root.style.setProperty('--orb-2', colors.orb2);
    root.style.setProperty('--orb-3', colors.orb3);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
