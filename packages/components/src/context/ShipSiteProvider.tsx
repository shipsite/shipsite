'use client';

import React, { createContext, useContext } from 'react';

export interface ShipSiteContextValue {
  siteName: string;
  siteUrl: string;
  logo?: string | { light: string; dark: string };
  ogImage?: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    text: string;
  };
  navigation: {
    items: Array<{ label: string; href: string }>;
    cta?: { label: string; href: string };
  };
  footer: {
    columns?: Array<{
      title: string;
      links: Array<{ label: string; href: string }>;
    }>;
    social?: Array<{ platform: string; href: string }>;
    copyright?: string;
  };
  navLinks: Record<string, string>;
  alternatePathMap: Record<string, Record<string, string>>;
  locale: string;
  locales: string[];
  defaultLocale: string;
}

const ShipSiteContext = createContext<ShipSiteContextValue | null>(null);

export function ShipSiteProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: ShipSiteContextValue;
}) {
  return (
    <ShipSiteContext.Provider value={value}>{children}</ShipSiteContext.Provider>
  );
}

export function useShipSite() {
  const context = useContext(ShipSiteContext);
  if (!context) {
    throw new Error('useShipSite must be used within a ShipSiteProvider');
  }
  return context;
}

export function useNavLinks() {
  return useShipSite().navLinks;
}

export function useResolveHref() {
  const { navLinks } = useShipSite();
  return (href: string): string => {
    if (
      href.startsWith('http') ||
      href.startsWith('#') ||
      href.startsWith('mailto:')
    ) {
      return href;
    }
    const slug = href.startsWith('/') ? href.slice(1) : href;
    return navLinks[slug] ?? href;
  };
}

export function useAlternateLinks() {
  return useShipSite().alternatePathMap;
}
