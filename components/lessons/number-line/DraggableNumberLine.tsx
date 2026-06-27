"use client";

import { useCallback, useRef } from "react";
import { NumberLineStrip } from "@/components/lessons/number-line/NumberLineStrip";
import { cn } from "@/lib/cn";
import type { FractionTone } from "@/types/lessonContent";

// ค่าเหล่านี้ต้องตรงกับ viewBox/ระยะขอบใน NumberLineStrip
const VB_TOTAL = 320;
const VB_LEFT = 26;
const VB_RIGHT = 294;

type Props = {
  denominator: number;
  value: number;
  onChange: (next: number) => void;
  units?: number;
  tone?: FractionTone;
  className?: string;
};

/** เส้นจำนวนที่คลิกหรือลากเมาส์/นิ้วเพื่อเลื่อนจุดได้ (จุดจะดูดเข้าขีดที่ใกล้ที่สุด) */
export function DraggableNumberLine({ denominator, value, onChange, units = 1, tone = "emerald", className }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const segments = Math.max(1, denominator) * Math.max(1, units);

  const updateFromX = useCallback(
    (clientX: number) => {
      const el = boxRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) return;
      const scale = rect.width / VB_TOTAL;
      const leftPx = rect.left + VB_LEFT * scale;
      const usablePx = (VB_RIGHT - VB_LEFT) * scale;
      let frac = (clientX - leftPx) / usablePx;
      frac = Math.max(0, Math.min(1, frac));
      const seg = Math.round(frac * segments);
      if (seg !== value) onChange(seg);
    },
    [segments, value, onChange],
  );

  return (
    <div
      ref={boxRef}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={segments}
      aria-valuenow={value}
      aria-label="ลากเพื่อเลื่อนจุดบนเส้นจำนวน"
      tabIndex={0}
      style={{ aspectRatio: `${VB_TOTAL} / 82` }}
      className={cn(
        "relative w-full max-w-lg cursor-pointer touch-none select-none rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
        className,
      )}
      onPointerDown={(e) => {
        dragging.current = true;
        try {
          e.currentTarget.setPointerCapture?.(e.pointerId);
        } catch {
          /* บาง environment ไม่รองรับ pointer capture */
        }
        updateFromX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (dragging.current) updateFromX(e.clientX);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" && value > 0) {
          e.preventDefault();
          onChange(value - 1);
        } else if (e.key === "ArrowRight" && value < segments) {
          e.preventDefault();
          onChange(value + 1);
        }
      }}
    >
      <NumberLineStrip
        denominator={denominator}
        marker={value}
        units={units}
        tone={tone}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </div>
  );
}
