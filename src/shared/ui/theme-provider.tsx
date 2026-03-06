"use client";

import * as React from "react";
import { useEffect } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  isMounted: boolean;
};

const STORAGE_KEY = "snab-theme";
const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function normalizeTheme(value: string | null): Theme {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }
  return "system";
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

function applyDocumentTheme(theme: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] =
    React.useState<ResolvedTheme>("light");
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    const initialTheme = normalizeTheme(
      window.localStorage.getItem(STORAGE_KEY),
    );
    const initialResolvedTheme = resolveTheme(initialTheme);
    setTheme(initialTheme);
    setResolvedTheme(initialResolvedTheme);
    applyDocumentTheme(initialResolvedTheme);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    const nextResolvedTheme = resolveTheme(theme);
    setResolvedTheme(nextResolvedTheme);
    applyDocumentTheme(nextResolvedTheme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, isMounted]);

  useEffect(() => {
    if (!isMounted || theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      const nextResolvedTheme = event.matches ? "dark" : "light";
      setResolvedTheme(nextResolvedTheme);
      applyDocumentTheme(nextResolvedTheme);
    };

    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, [theme, isMounted]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        isMounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
