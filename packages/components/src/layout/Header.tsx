'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { useShipSite, useResolveHref } from '../context/ShipSiteProvider';
import { cn } from '../lib/utils';
import { Button } from '../ui/button';
import { Navbar, NavbarLeft, NavbarRight } from '../ui/navbar';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from '../ui/sheet';
import { ThemeToggle } from '../ui/theme-toggle';
import { ClientOnly } from '../ui/client-only';

export function Header() {
  const { siteName, logo, navigation, locale, defaultLocale } = useShipSite();
  const resolveHref = useResolveHref();

  const logoSrc = typeof logo === 'string' ? logo : logo?.light;

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container-main">
        <Navbar>
          <NavbarLeft>
            <a
              href={locale === defaultLocale ? '/' : `/${locale}`}
              className="flex items-center gap-2"
            >
              {logoSrc && (
                <img src={logoSrc} alt={siteName} className="h-8 w-auto" />
              )}
              <span className="font-semibold text-lg text-foreground">
                {siteName}
              </span>
            </a>
          </NavbarLeft>

          <NavbarRight className="hidden md:flex">
            {navigation.items.map((item) => (
              <a
                key={item.href}
                href={resolveHref(item.href)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
            <ThemeToggle />
            {navigation.cta && (
              <Button asChild size="sm">
                <a href={navigation.cta.href}>
                  {navigation.cta.label}
                </a>
              </Button>
            )}
          </NavbarRight>

          <div className="md:hidden">
            <ClientOnly fallback={
              <Button variant="ghost" size="icon" aria-label="Toggle menu">
                <Menu className="size-5" />
              </Button>
            }>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Toggle menu">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <nav className="flex flex-col gap-4 mt-8">
                    {navigation.items.map((item) => (
                      <a
                        key={item.href}
                        href={resolveHref(item.href)}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </a>
                    ))}
                    {navigation.cta && (
                      <Button asChild className="mt-2">
                        <a href={navigation.cta.href}>
                          {navigation.cta.label}
                        </a>
                      </Button>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </ClientOnly>
          </div>
        </Navbar>
      </div>
    </header>
  );
}
