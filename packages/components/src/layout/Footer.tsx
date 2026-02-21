'use client';

import React from 'react';
import { useShipSite, useResolveHref } from '../context/ShipSiteProvider';

export function Footer() {
  const { siteName, footer } = useShipSite();
  const resolveHref = useResolveHref();

  return (
    <footer className="bg-[var(--ss-text)] text-white/80">
      <div className="container-main py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {footer.columns?.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-white mb-4">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={resolveHref(link.href)}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            {footer.copyright ||
              `\u00A9 ${new Date().getFullYear()} ${siteName}`}
          </p>

          {footer.social && footer.social.length > 0 && (
            <div className="flex items-center gap-4">
              {footer.social.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/50 hover:text-white transition-colors capitalize"
                >
                  {social.platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
