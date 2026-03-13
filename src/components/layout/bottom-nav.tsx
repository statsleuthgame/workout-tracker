"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Calendar, TrendingUp, Scale } from "lucide-react";

const navItems = [
  { href: "/today", label: "Today", Icon: Zap },
  { href: "/week", label: "Week", Icon: Calendar },
  { href: "/progress", label: "Progress", Icon: TrendingUp },
  { href: "/weight-log", label: "Weight", Icon: Scale },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-md justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-all ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.Icon className={`h-6 w-6 transition-transform ${isActive ? "scale-110" : ""}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
