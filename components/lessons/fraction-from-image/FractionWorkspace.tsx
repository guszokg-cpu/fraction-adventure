"use client";

import { Check } from "lucide-react";
import { ClickableFractionCircle } from "@/components/lessons/shared/ClickableFractionCircle";
import { ClickableFractionBar } from "@/components/lessons/shared/ClickableFractionBar";
import { ClickableFractionVerticalBar } from "@/components/lessons/shared/ClickableFractionVerticalBar";
import { ClickableFractionCup } from "@/components/lessons/shared/ClickableFractionCup";
import { cn } from "@/lib/cn";
import type { ShapeKind } from "@/components/lessons/fraction-from-image/ShapeSelector";

type Props = {
  shape: ShapeKind;
  denominator: number;
  coloredParts: boolean[][];
  colorHex: string;
  onToggle: (shapeIndex: number, partIndex: number) => void;
};

const SHAPE_CLASS: Record<ShapeKind, string> = {
  circle: "h-40 w-40",
  horizontal: "h-20 w-full max-w-[240px]",
  vertical: "h-52 w-24",
  cup: "h-52 w-32",
};

export function FractionWorkspace({ shape, denominator, coloredParts, colorHex, onToggle }: Props) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-500">
        <span>👆</span>
        คลิกที่แต่ละส่วนของภาพเพื่อระบายหรือยกเลิกการระบาย
      </div>

      <div className="flex flex-wrap items-start justify-center gap-6">
        {coloredParts.map((filled, shapeIndex) => {
          const filledCount = filled.filter(Boolean).length;
          const isFull = filledCount === denominator;

          return (
            <div key={shapeIndex} className="flex flex-col items-center gap-2.5">
              <div className={cn("flex items-center justify-center", SHAPE_CLASS[shape])}>
                {shape === "circle" && (
                  <ClickableFractionCircle
                    denominator={denominator}
                    filled={filled}
                    onToggle={(i) => onToggle(shapeIndex, i)}
                    color={colorHex}
                    className="h-full w-full"
                  />
                )}
                {shape === "horizontal" && (
                  <ClickableFractionBar
                    denominator={denominator}
                    filled={filled}
                    onToggle={(i) => onToggle(shapeIndex, i)}
                    color={colorHex}
                    className="h-full w-full"
                  />
                )}
                {shape === "vertical" && (
                  <ClickableFractionVerticalBar
                    denominator={denominator}
                    filled={filled}
                    onToggle={(i) => onToggle(shapeIndex, i)}
                    color={colorHex}
                    className="h-full w-full"
                  />
                )}
                {shape === "cup" && (
                  <ClickableFractionCup
                    denominator={denominator}
                    filled={filled}
                    onToggle={(i) => onToggle(shapeIndex, i)}
                    color={colorHex}
                    className="h-full w-full"
                  />
                )}
              </div>

              <div className="text-sm font-extrabold text-slate-600">รูปที่ {shapeIndex + 1}</div>

              {isFull ? (
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
                  <Check size={12} />
                  เต็ม 1 รูป
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-500">
                  {filledCount} จาก {denominator} ส่วน
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
