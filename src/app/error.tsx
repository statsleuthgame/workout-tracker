"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] render error", error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center bg-background px-6">
      <div className="text-center max-w-xs">
        <p className="text-lg font-bold">Something went wrong</p>
        <p className="mt-2 text-sm text-muted-foreground">
          The app hit an unexpected error. Your saved data is safe.
        </p>
        <button
          onClick={reset}
          className="mt-5 rounded-2xl btn-gradient-primary px-6 py-3 text-sm font-bold active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
