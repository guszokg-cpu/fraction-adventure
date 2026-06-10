"use client";

import { Check } from "lucide-react";
import { themePresets } from "@/data/themePresets";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-2 gap-3">
      {themePresets.map((preset) => (
        <button
          key={preset.id}
          onClick={() => setTheme(preset.id)}
          className={cn(
            "rounded-xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft",
            theme === preset.id ? "border-brand-500 ring-4 ring-brand-100" : "border-slate-200"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex gap-2">
              {preset.swatches.map((swatch) => (
                <span key={swatch} className="h-7 w-7 rounded-full border border-white shadow" style={{ backgroundColor: swatch }} />
              ))}
            </div>
            {theme === preset.id && (
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-white">
                <Check size={16} />
              </span>
            )}
          </div>
          <div className="mt-3 text-lg font-extrabold text-brand-900">{preset.name}</div>
          <p className="mt-1 text-sm font-semibold text-slate-600">{preset.description}</p>
        </button>
      ))}
    </div>
  );
}
