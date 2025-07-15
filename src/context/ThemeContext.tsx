import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'light' | 'auto';

export interface ThemeColors {
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryHover: string;
  success: string;
  warning: string;
  error: string;
  canvas: string;
  nodeBackground: string;
  nodeBorder: string;
  connection: string;
}

export interface ThemeConfig {
  theme: Theme;
  colors: ThemeColors;
  animations: boolean;
  gridSnap: boolean;
  minimap: boolean;
}

const darkTheme: ThemeColors = {
  background: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  primary: '#8b5cf6',
  primaryHover: '#7c3aed',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  canvas: '#111827',
  nodeBackground: '#374151',
  nodeBorder: '#6b7280',
  connection: '#8b5cf6',
};

const lightTheme: ThemeColors = {
  background: '#ffffff',
  surface: '#f8fafc',
  border: '#e2e8f0',
  text: '#1e293b',
  textSecondary: '#64748b',
  primary: '#8b5cf6',
  primaryHover: '#7c3aed',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  canvas: '#f9fafb',
  nodeBackground: '#ffffff',
  nodeBorder: '#d1d5db',
  connection: '#8b5cf6',
};

interface ThemeContextType {
  config: ThemeConfig;
  setTheme: (theme: Theme) => void;
  toggleAnimations: () => void;
  toggleGridSnap: () => void;
  toggleMinimap: () => void;
  getSystemTheme: () => 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('themeConfig');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back to default
      }
    }
    
    return {
      theme: 'auto' as Theme,
      colors: darkTheme,
      animations: true,
      gridSnap: true,
      minimap: true,
    };
  });

  const getSystemTheme = useCallback((): 'dark' | 'light' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const getCurrentTheme = useCallback((): 'dark' | 'light' => {
    if (config.theme === 'auto') {
      return getSystemTheme();
    }
    return config.theme;
  }, [config.theme, getSystemTheme]);

  // Update colors when theme changes
  useEffect(() => {
    const currentTheme = getCurrentTheme();
    const newColors = currentTheme === 'dark' ? darkTheme : lightTheme;
    
    setConfig(prev => ({
      ...prev,
      colors: newColors,
    }));
  }, [config.theme, getCurrentTheme]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (config.theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const newColors = getSystemTheme() === 'dark' ? darkTheme : lightTheme;
      setConfig(prev => ({
        ...prev,
        colors: newColors,
      }));
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [config.theme, getSystemTheme]);

  // Save to localStorage when config changes
  useEffect(() => {
    localStorage.setItem('themeConfig', JSON.stringify(config));
  }, [config]);

  // Apply CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(config.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });

    // Add theme class to body
    document.body.className = getCurrentTheme();
    
    // Add animations class
    if (config.animations) {
      document.body.classList.add('animations-enabled');
    } else {
      document.body.classList.remove('animations-enabled');
    }
  }, [config, getCurrentTheme]);

  const setTheme = (theme: Theme) => {
    setConfig(prev => ({ ...prev, theme }));
  };

  const toggleAnimations = () => {
    setConfig(prev => ({ ...prev, animations: !prev.animations }));
  };

  const toggleGridSnap = () => {
    setConfig(prev => ({ ...prev, gridSnap: !prev.gridSnap }));
  };

  const toggleMinimap = () => {
    setConfig(prev => ({ ...prev, minimap: !prev.minimap }));
  };

  const value: ThemeContextType = {
    config,
    setTheme,
    toggleAnimations,
    toggleGridSnap,
    toggleMinimap,
    getSystemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 