'use client';

import React from 'react';
import { useShipSite, useResolveHref } from '../context/ShipSiteProvider';
import {
  FooterRoot,
  FooterContent,
  FooterColumn,
  FooterBottom,
} from '../ui/footer';
import { LocaleSwitcher } from '../ui/locale-switcher';

export function Footer() {
  const { siteName, footer } = useShipSite();
  const resolveHref = useResolveHref();

  return (
    <footer className="border-t border-border">
      <FooterRoot>
        <div className="container-main">
          <FooterContent>
            {footer.columns?.map((column) => (
              <FooterColumn key={column.title}>
                <h3 className="text-sm font-semibold text-foreground">
                  {column.title}
                </h3>
                <ul className="flex flex-col gap-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={resolveHref(link.href)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </FooterColumn>
            ))}
          </FooterContent>

          <FooterBottom>
            <p>
              {footer.copyright ||
                `\u00A9 ${new Date().getFullYear()} ${siteName}`}
            </p>

            <div className="flex items-center gap-4">
              {footer.social &&
                footer.social.length > 0 &&
                footer.social.map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors capitalize"
                  >
                    {social.platform}
                  </a>
                ))}
              <LocaleSwitcher />
            </div>
          </FooterBottom>
        </div>
      </FooterRoot>
    </footer>
  );
}
