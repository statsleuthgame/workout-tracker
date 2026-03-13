"use client";

interface FormCueTipProps {
  cues: string[];
}

export function FormCueTip({ cues }: FormCueTipProps) {
  if (!cues.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {cues.map((cue, i) => (
        <span
          key={i}
          className="rounded-full bg-success-muted px-2.5 py-0.5 text-xs font-medium text-success"
        >
          {cue}
        </span>
      ))}
    </div>
  );
}
