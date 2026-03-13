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
        <div className="glass-card-elevated flex justify-around rounded-2xl">
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
                <item.Icon
                  className={`h-5 w-5 transition-all duration-200 ${
                    isActive ? "scale-110" : ""
                  }`}
                />
                <span className={`text-[11px] font-medium ${isActive ? "font-semibold" : ""}`}>
                  {item.label}
                </span>
                {isActive && <span className="w-5 h-1 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
