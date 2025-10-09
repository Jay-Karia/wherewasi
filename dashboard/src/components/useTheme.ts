import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "wwi-theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved === "light" || saved === "dark") return saved;
    } catch (e) {
      // ignore
    }
    // default to system preference
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return { theme, setTheme } as const;
}
