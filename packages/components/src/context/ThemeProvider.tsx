'use client';

import React, { useEffect, useState } from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
    >
      {children}
    </NextThemeProvider>
  );
}
