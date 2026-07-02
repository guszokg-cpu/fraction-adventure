"use client";

import { cn } from "@/lib/cn";

const SHAPE_COUNT_OPTIONS = [1, 2, 3, 4, 5];

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export function ShapeCountSelector({ value, onChange }: Props) {
  return (
    <div>
      <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">2. เลือกจำนวนรูป</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {SHAPE_COUNT_OPTIONS.map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={cn(
              "h-10 w-10 rounded-xl border text-base font-extrabold transition",
              v === value
                ? "border-violet-500 bg-violet-500 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50"
            )}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
