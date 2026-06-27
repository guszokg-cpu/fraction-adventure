"use client";

import { cn } from "@/lib/cn";

type Size = "sm" | "md" | "lg";

type Props = {
  numerator: number;
  denominator: number;
  onChange: (num: number, den: number) => void;
  size?: Size;
  /** Tailwind color key used for border/focus/line */
  colorClass?: string;
  className?: string;
};

const sizes: Record<Size, { box: string; line: string }> = {
  sm: { box: "h-9 w-12 text-xl",  line: "my-0.5 h-[2px] w-12" },
  md: { box: "h-11 w-16 text-2xl", line: "my-1   h-[3px] w-16" },
  lg: { box: "h-14 w-20 text-3xl", line: "my-1   h-1     w-20" },
};

/** กล่อง input สำหรับป้อนเศษส่วน — ตัวเศษอยู่บน เส้นคั่นกลาง ตัวส่วนอยู่ล่าง */
export function FractionInput({
  numerator,
  denominator,
  onChange,
  size = "md",
  colorClass = "border-pink-300 focus:border-pink-500 focus:ring-pink-100 bg-pink-600",
  className,
}: Props) {
  const s = sizes[size];

  // Split colorClass into parts for input vs line
  // Expect colorClass like "border-pink-300 focus:border-pink-500 focus:ring-pink-100 bg-pink-600"
  // The bg-* part goes on the line div; rest goes on inputs
  const parts = colorClass.split(" ");
  const lineBg = parts.find(p => p.startsWith("bg-")) ?? "bg-pink-600";
  const inputColor = parts.filter(p => !p.startsWith("bg-")).join(" ");

  const inputCls = cn(
    "block rounded-xl border-2 bg-white text-center font-extrabold transition",
    "focus:outline-none focus:ring-2",
    // Hide browser number-input spinner arrows
    "[appearance:textfield]",
    "[&::-webkit-inner-spin-button]:appearance-none",
    "[&::-webkit-outer-spin-button]:appearance-none",
    s.box,
    inputColor,
  );

  return (
    <div className={cn("inline-flex flex-col items-center", className)}>
      {/* ── ตัวเศษ (บน) ── */}
      <input
        type="number"
        value={numerator}
        min={1}
        max={99}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v) && v >= 1 && v <= 99) onChange(v, denominator);
        }}
        className={inputCls}
      />
      {/* ── เส้นคั่น ── */}
      <div className={cn("rounded-full", s.line, lineBg)} />
      {/* ── ตัวส่วน (ล่าง) ── */}
      <input
        type="number"
        value={denominator}
        min={1}
        max={20}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v) && v >= 1 && v <= 20) onChange(numerator, v);
        }}
        className={inputCls}
      />
    </div>
  );
}
