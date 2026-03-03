'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/icon';
import { useConfigStore } from '@/stores/use-config-store';

const NAV_ITEMS = [
  { label: 'Generator', icon: 'edit_note', href: '/' },
  { label: 'Produkty', icon: 'inventory_2', href: '/products' },
  { label: 'Lokalizacje', icon: 'location_on', href: '/locations' },
  { label: 'Ekipa', icon: 'badge', href: '/employees' },
  { label: 'Statystyki', icon: 'monitoring', href: '/stats' },
  { label: 'Ustawienia', icon: 'settings', href: '/settings' },
];

export function NavigationDrawer() {
  const pathname = usePathname();
  const { isDirty, saveToServer } = useConfigStore();

  return (
    <>
      {/* Mobile Navigation Bar (Bottom) */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-bg-raised border-t border-border-subtle flex items-center justify-around px-2 z-50 lg:hidden">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 min-w-[64px] transition-colors",
                isActive ? "text-primary" : "text-text-secondary"
              )}
            >
              <div className={cn(
                "w-16 h-8 rounded-full flex items-center justify-center mb-1 transition-colors",
                isActive ? "bg-primary-subtle" : "group-hover:bg-hover-overlay"
              )}>
                <Icon name={item.icon} fill={isActive} />
              </div>
              <span className="label-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop Navigation Drawer (Left) */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-bg-raised border-r border-border-subtle hidden lg:flex flex-col p-3 z-50">
        <div className="flex items-center h-[88px] px-6">
          <Image src="/favicon.png" alt="Burbone Logo" width={48} height={48} />
        </div>
        
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-6 h-14 rounded-full transition-colors",
                  isActive 
                    ? "bg-primary-subtle text-primary" 
                    : "text-text-secondary hover:bg-hover-overlay hover:text-text-primary"
                )}
              >
                <Icon name={item.icon} fill={isActive} />
                <span className="title-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Save Button */}
        <div className="mt-auto pt-4 border-t border-border-subtle">
          <button
            onClick={() => saveToServer()}
            disabled={!isDirty}
            className={cn(
              "w-full flex items-center gap-3 px-6 h-14 rounded-full transition-all",
              isDirty 
                ? "bg-primary text-on-primary shadow-glow-primary cursor-pointer active:scale-95" 
                : "bg-bg-elevated text-text-disabled cursor-not-allowed"
            )}
          >
            <Icon name={isDirty ? "save" : "check"} />
            <span className="title-medium">{isDirty ? "ZAPISZ ZMIANY" : "ZAPISANO"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
