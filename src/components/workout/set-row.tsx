"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { NumberInput } from "@/components/common/number-input";

interface SetRowProps {
  setNumber: number;
  targetReps: string;
  completed: boolean;
  actualWeight?: number;
  actualReps?: number;
  onWeightChange: (weight: number | undefined) => void;
  onRepsChange: (reps: number | undefined) => void;
  onComplete: (completed: boolean) => void;
  suggestionLabel?: string | null;
}

export function SetRow({
  setNumber,
  targetReps,
  completed,
  actualWeight,
  actualReps,
  onWeightChange,
  onRepsChange,
  onComplete,
  suggestionLabel,
}: SetRowProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
        completed ? "bg-emerald-50" : "bg-muted/50"
      }`}
    >
      <Checkbox
        checked={completed}
        onCheckedChange={(checked) => onComplete(checked === true)}
        className="h-6 w-6 rounded-md border-2 data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
      />

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            SET {setNumber}
          </span>
          <span className="text-xs text-muted-foreground">
            Target: {targetReps}
          </span>
        </div>
        {suggestionLabel && !completed && (
          <p className="mt-0.5 text-xs font-medium text-blue-600">
            {suggestionLabel}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="text-center">
          <p className="text-[10px] font-medium text-muted-foreground">LBS</p>
          <NumberInput
            value={actualWeight}
            onChange={onWeightChange}
            placeholder="Lbs"
            step={5}
          />
        </div>
        <div className="text-center">
          <p className="text-[10px] font-medium text-muted-foreground">REPS</p>
          <NumberInput
            value={actualReps}
            onChange={onRepsChange}
            placeholder="0"
            step={1}
          />
        </div>
      </div>
    </div>
  );
}
