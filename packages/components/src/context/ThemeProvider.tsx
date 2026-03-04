'use client';

import React from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';

export function ThemeProvider({
  children,
  darkMode = true,
}: {
  children: React.ReactNode;
  darkMode?: boolean;
}) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme={darkMode ? 'system' : 'light'}
      enableSystem={darkMode}
      forcedTheme={darkMode ? undefined : 'light'}
    >
      {children}
    </NextThemeProvider>
  );
}
