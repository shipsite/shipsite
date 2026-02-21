'use client';

import React, { useState } from 'react';
import { useShipSite, useResolveHref } from '../context/ShipSiteProvider';

export function Header() {
  const { siteName, logo, navigation, locale, defaultLocale } = useShipSite();
  const resolveHref = useResolveHref();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoSrc = typeof logo === 'string' ? logo : logo?.light;

  return (
    <header className="sticky top-0 z-50 bg-[var(--ss-background)]/95 backdrop-blur-md border-b border-gray-100">
      <div className="container-main">
        <nav className="flex items-center justify-between py-4">
          <a
            href={locale === defaultLocale ? '/' : `/${locale}`}
            className="flex items-center gap-2"
          >
            {logoSrc && (
              <img src={logoSrc} alt={siteName} className="h-8 w-auto" />
            )}
            <span className="font-semibold text-lg text-[var(--ss-text)]">
              {siteName}
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navigation.items.map((item) => (
              <a
                key={item.href}
                href={resolveHref(item.href)}
                className="text-sm font-medium text-[var(--ss-text)]/70 hover:text-[var(--ss-text)] transition-colors"
              >
                {item.label}
              </a>
            ))}
            {navigation.cta && (
              <a
                href={navigation.cta.href}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--ss-primary)] hover:bg-[var(--ss-primary-600)] transition-colors"
              >
                {navigation.cta.label}
              </a>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            {navigation.items.map((item) => (
              <a
                key={item.href}
                href={resolveHref(item.href)}
                className="block text-sm font-medium text-[var(--ss-text)]/70 hover:text-[var(--ss-text)]"
              >
                {item.label}
              </a>
            ))}
            {navigation.cta && (
              <a
                href={navigation.cta.href}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--ss-primary)]"
              >
                {navigation.cta.label}
              </a>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
