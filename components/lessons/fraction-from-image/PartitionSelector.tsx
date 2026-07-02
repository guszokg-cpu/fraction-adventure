"use client";

import { cn } from "@/lib/cn";

const DENOMINATOR_OPTIONS = [2, 3, 4, 5, 6, 8, 10, 12];

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export function PartitionSelector({ value, onChange }: Props) {
  return (
    <div>
      <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">3. เลือกจำนวนส่วนที่แบ่ง</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {DENOMINATOR_OPTIONS.map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={cn(
              "h-10 w-10 rounded-xl border text-base font-extrabold transition",
              v === value
                ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50"
            )}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
