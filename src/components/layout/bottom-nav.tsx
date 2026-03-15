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
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto max-w-md px-3 pb-2">
        <div className="glass-card-elevated flex justify-around rounded-2xl px-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                prefetch={true}
                className={`relative flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors duration-150 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground active:scale-95"
                }`}
              >
                <item.Icon className={`h-5 w-5 transition-transform duration-150 ${isActive ? "scale-110" : ""}`} />
                <span className={`text-[11px] font-medium ${isActive ? "font-semibold" : ""}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full" style={{ background: "var(--gradient-primary)" }} />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
