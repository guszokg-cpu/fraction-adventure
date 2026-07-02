"use client";

import { cn } from "@/lib/cn";
import type { FractionKind } from "@/lib/fractionUtils";

const OPTIONS: { id: FractionKind; label: string; example: string }[] = [
  { id: "proper", label: "เศษส่วนแท้", example: "เช่น 3/4" },
  { id: "improper", label: "เศษเกิน", example: "เช่น 7/4" },
  { id: "mixed", label: "จำนวนคละ", example: "เช่น 1 3/4" },
];

type Props = {
  value: FractionKind[];
  onChange: (value: FractionKind[]) => void;
};

export function FractionKindSelector({ value, onChange }: Props) {
  function toggle(id: FractionKind) {
    if (value.includes(id)) {
      if (value.length === 1) return; // ต้องเลือกอย่างน้อย 1 ชนิดเสมอ
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {OPTIONS.map((opt) => {
        const active = value.includes(opt.id);
        return (
          <button
            key={opt.id}
            onClick={() => toggle(opt.id)}
            className={cn(
              "rounded-2xl border-2 p-4 text-left transition",
              active ? "border-brand-600 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-200"
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 text-xs font-extrabold",
                  active ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white"
                )}
              >
                {active && "✓"}
              </span>
              <span className="text-base font-extrabold text-brand-900">{opt.label}</span>
            </div>
            <p className="mt-1 pl-7 text-sm font-bold text-slate-500">{opt.example}</p>
          </button>
        );
      })}
    </div>
  );
}
