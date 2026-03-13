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
          className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
        >
          {cue}
        </span>
      ))}
    </div>
  );
}
