import { useContext } from "react";
import {
  ThemeContext,
  type ThemeContextValue,
  type ThemeMode,
} from "@/context/theme-context";

export type { ThemeMode };

export function useThemeMode(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeMode must be used within ThemeProvider");
  }

  return ctx;
}
