'use client';

import { useState, useEffect, type ReactNode } from 'react';

/**
 * Renders children only on the client after hydration.
 * Prevents Radix UI useId() hydration mismatches between server and client.
 */
export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? children : fallback;
}
