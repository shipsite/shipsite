'use client';

import React from 'react';
import { ChevronDown, Menu } from 'lucide-react';
import { useShipSite, useResolveHref } from '../context/ShipSiteProvider';
import { cn } from '../lib/utils';
import { Button } from '../ui/button';
import { Navbar, NavbarLeft, NavbarRight } from '../ui/navbar';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../ui/navigation-menu';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from '../ui/sheet';
import { ThemeToggle } from '../ui/theme-toggle';
import { ClientOnly } from '../ui/client-only';

type NavItem = { label: string; href: string } | {
  label: string;
  children: Array<{ label: string; href: string; description?: string }>;
  featured?: { title: string; description?: string; href: string; image: string };
};

function isSubmenu(item: NavItem): item is Extract<NavItem, { children: any }> {
  return 'children' in item;
}

export function Header() {
  const { siteName, logo, navigation, locale, defaultLocale, darkMode } = useShipSite();
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
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                {navigation.items.map((item, idx) => {
                  if (isSubmenu(item)) {
                    return (
                      <NavigationMenuItem key={idx}>
                        <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          {item.featured ? (
                            <div className="grid w-[400px] gap-3 md:w-[500px] md:grid-cols-[.75fr_1fr] lg:w-[600px]">
                              <NavigationMenuLink asChild>
                                <a
                                  href={resolveHref(item.featured.href)}
                                  className="flex flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none select-none focus:shadow-md"
                                >
                                  <img
                                    src={item.featured.image}
                                    alt={item.featured.title}
                                    className="mb-2 h-24 w-full rounded object-cover"
                                  />
                                  <div className="mb-1 text-sm font-medium leading-none">
                                    {item.featured.title}
                                  </div>
                                  {item.featured.description && (
                                    <p className="text-xs leading-snug text-muted-foreground">
                                      {item.featured.description}
                                    </p>
                                  )}
                                </a>
                              </NavigationMenuLink>
                              <ul className="flex flex-col gap-1 p-1">
                                {item.children.map((child) => (
                                  <li key={child.href}>
                                    <NavigationMenuLink asChild>
                                      <a href={resolveHref(child.href)} className="block rounded-md p-2 hover:bg-foreground/5">
                                        <div className="text-sm font-medium leading-none">{child.label}</div>
                                        {child.description && (
                                          <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
                                            {child.description}
                                          </p>
                                        )}
                                      </a>
                                    </NavigationMenuLink>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <ul className="grid w-[300px] gap-1 p-1 md:w-[400px] md:grid-cols-2">
                              {item.children.map((child) => (
                                <li key={child.href}>
                                  <NavigationMenuLink asChild>
                                    <a href={resolveHref(child.href)} className="block rounded-md p-2 hover:bg-foreground/5">
                                      <div className="text-sm font-medium leading-none">{child.label}</div>
                                      {child.description && (
                                        <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
                                          {child.description}
                                        </p>
                                      )}
                                    </a>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          )}
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    );
                  }

                  return (
                    <NavigationMenuItem key={item.href}>
                      <NavigationMenuLink asChild>
                        <a
                          href={resolveHref(item.href)}
                          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex h-9 items-center px-4 py-2"
                        >
                          {item.label}
                        </a>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
            {darkMode && <ThemeToggle />}
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
                    {navigation.items.map((item, idx) => {
                      if (isSubmenu(item)) {
                        return (
                          <MobileSubmenu key={idx} item={item} resolveHref={resolveHref} />
                        );
                      }
                      return (
                        <a
                          key={item.href}
                          href={resolveHref(item.href)}
                          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {item.label}
                        </a>
                      );
                    })}
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

function MobileSubmenu({
  item,
  resolveHref,
}: {
  item: Extract<NavItem, { children: any }>;
  resolveHref: (href: string) => string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        {item.label}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-2 ml-3 flex flex-col gap-2 border-l border-border pl-3">
          {item.children.map((child) => (
            <a
              key={child.href}
              href={resolveHref(child.href)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {child.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
