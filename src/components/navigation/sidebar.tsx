"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { mainNav, settingsNav } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn"; // Assuming you have a cn utility

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen p-4 bg-bg-raised border-r border-border-subtle">
      <div className="text-lg font-bold text-text-primary mb-8">Burbone</div>
      <nav className="flex-1 flex flex-col gap-2">
        {mainNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-md text-text-secondary text-base font-medium transition-colors",
                "hover:bg-hover-overlay hover:text-text-primary",
                isActive && "bg-selected-bg text-primary"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div>
        {settingsNav.map((item) => {
             const isActive = pathname === item.href;
             return(
                <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-md text-text-secondary text-base font-medium transition-colors",
                  "hover:bg-hover-overlay hover:text-text-primary",
                  isActive && "bg-selected-bg text-primary"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
             )
        })}
      </div>
    </aside>
  );
}
