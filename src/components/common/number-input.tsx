"use client";

import { useState } from "react";

interface NumberInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  step?: number;
  min?: number;
  className?: string;
}

export function NumberInput({
  value,
  onChange,
  placeholder = "0",
  step = 5,
  min = 0,
  className = "",
}: NumberInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, (value || 0) - step))}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-lg font-bold text-muted-foreground transition-colors active:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Decrease"
      >
        -
      </button>
      <input
        type="number"
        inputMode="decimal"
        value={focused ? (value ?? "") : (value ?? "")}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? undefined : parseFloat(v));
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="h-12 w-20 rounded-xl border border-border bg-background text-center text-lg font-semibold outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary"
      />
      <button
        type="button"
        onClick={() => onChange((value || 0) + step)}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-lg font-bold text-muted-foreground transition-colors active:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}
