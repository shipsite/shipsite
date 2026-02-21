'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '../lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={cn('flex items-center gap-0.5 rounded-full border border-border p-0.5', className)}>
      <button
        onClick={() => setTheme('light')}
        className={cn(
          'rounded-full p-1.5 transition-colors',
          theme === 'light' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
        aria-label="Light theme"
      >
        <Sun className="size-3.5" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={cn(
          'rounded-full p-1.5 transition-colors',
          theme === 'system' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
        aria-label="System theme"
      >
        <Monitor className="size-3.5" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          'rounded-full p-1.5 transition-colors',
          theme === 'dark' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
        aria-label="Dark theme"
      >
        <Moon className="size-3.5" />
      </button>
    </div>
  );
}
