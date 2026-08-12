import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/bottom-nav";
import { DbProvider } from "@/components/layout/db-provider";
import { weeklyPlan } from "@/lib/workout-plan/templates";
import { THEME_META_COLORS } from "@/lib/constants/theme-colors";

// Day-of-week (0=Sun..6=Sat) -> dayTheme, serialized into the inline script
// below so the day accent applies before first paint (no green flash).
const THEMES_BY_DAY = JSON.stringify(
  Array.from({ length: 7 }, (_, i) => weeklyPlan.find((d) => d.dayOfWeek === i)?.dayTheme ?? "rest")
);
const META_COLORS = JSON.stringify(THEME_META_COLORS);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workout Tracker",
  description: "Your personal workout tracker with progressive overload",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#166534",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var themes=${THEMES_BY_DAY};var colors=${META_COLORS};var t=themes[new Date().getDay()];document.documentElement.setAttribute('data-day-theme',t);var apply=function(){var m=document.querySelector('meta[name="theme-color"]');if(m&&colors[t])m.setAttribute('content',colors[t])};apply();window.addEventListener('load',apply)}catch(e){}})()`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker'in navigator){var hadController=!!navigator.serviceWorker.controller;window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js')});var reloaded=false;navigator.serviceWorker.addEventListener('controllerchange',function(){if(reloaded)return;reloaded=true;if(hadController)window.location.reload()})}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-1/3 -right-1/4 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px] blob-float" />
          <div className="absolute top-1/2 -left-1/3 h-[500px] w-[500px] rounded-full bg-info/8 blur-[100px] blob-float-reverse" />
          <div className="absolute -bottom-1/4 right-1/3 h-[400px] w-[400px] rounded-full bg-success/5 blur-[100px] blob-float" />
        </div>
        <DbProvider>
          <main className="mx-auto min-h-screen max-w-md pb-28">
            {children}
          </main>
          <BottomNav />
        </DbProvider>
      </body>
    </html>
  );
}
