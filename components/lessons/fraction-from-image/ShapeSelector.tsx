"use client";

import { cn } from "@/lib/cn";

export type ShapeKind = "circle" | "horizontal" | "vertical" | "cup";

export const SHAPE_OPTIONS: { id: ShapeKind; label: string; icon: string }[] = [
  { id: "circle", label: "วงกลม", icon: "⏺" },
  { id: "horizontal", label: "สี่เหลี่ยมแนวนอน", icon: "▭" },
  { id: "vertical", label: "สี่เหลี่ยมแนวตั้ง", icon: "▯" },
  { id: "cup", label: "แก้วน้ำ", icon: "🥛" },
];

type Props = {
  value: ShapeKind;
  onChange: (value: ShapeKind) => void;
};

export function ShapeSelector({ value, onChange }: Props) {
  return (
    <div>
      <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">1. เลือกรูปทรง</div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {SHAPE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              "flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-extrabold transition",
              value === opt.id
                ? "border-brand-600 bg-brand-50 text-brand-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50/40"
            )}
          >
            <span className="text-lg">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
