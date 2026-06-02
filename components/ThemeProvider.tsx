"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type GradFlowTheme = "light" | "dark";

type ThemeContextType = {
  theme: GradFlowTheme;
  isDarkMode: boolean;
  setTheme: (theme: GradFlowTheme) => void;
  toggleTheme: () => void;
};

type ThemeProviderProps = {
  children: ReactNode;
};

const THEME_STORAGE_KEY = "gradflow-theme";

const ThemeContext = createContext<ThemeContextType | null>(null);

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<GradFlowTheme>("light");

  // ===============================
  // APPLY THEME TO HTML
  // ===============================
  const applyThemeToDocument = (selectedTheme: GradFlowTheme) => {
    const root = document.documentElement;

    root.classList.remove("theme-light", "theme-dark");
    root.classList.add(selectedTheme === "dark" ? "theme-dark" : "theme-light");
  };

  // ===============================
  // LOAD THEME
  // ===============================
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme === "dark" || savedTheme === "light") {
      setThemeState(savedTheme);
      applyThemeToDocument(savedTheme);
      return;
    }

    setThemeState("light");
    applyThemeToDocument("light");
  }, []);

  // ===============================
  // SET THEME
  // ===============================
  const setTheme = (selectedTheme: GradFlowTheme) => {
    setThemeState(selectedTheme);
    localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);
    applyThemeToDocument(selectedTheme);
  };

  // ===============================
  // TOGGLE THEME
  // ===============================
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const value = useMemo(
    () => ({
      theme,
      isDarkMode: theme === "dark",
      setTheme,
      toggleTheme,
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
