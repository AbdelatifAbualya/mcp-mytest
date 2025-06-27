"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  themes?: string[] | Record<string, string>;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
  children,
  attribute = "data-theme",
  defaultTheme = "default-dark",
  themes = [],
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute as any}
      defaultTheme={defaultTheme}
      value={themes as any}
      disableTransitionOnChange={disableTransitionOnChange}
      enableSystem={false}
    >
      {children}
    </NextThemesProvider>
  );
}
