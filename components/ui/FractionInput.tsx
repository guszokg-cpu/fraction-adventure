"use client";

import { useEffect, useState } from "react";
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
  minNumerator?: number;
  maxNumerator?: number;
  minDenominator?: number;
  maxDenominator?: number;
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
  minNumerator = 1,
  maxNumerator = 99,
  minDenominator = 1,
  maxDenominator = 20,
}: Props) {
  const s = sizes[size];

  // buffer ข้อความภายใน เพื่อให้ลบ/พิมพ์ทับได้ลื่น (ค่าที่ไม่ถูกต้องระหว่างพิมพ์จะไม่กระโดดกลับ)
  const [numText, setNumText] = useState(String(numerator));
  const [denText, setDenText] = useState(String(denominator));

  // ซิงก์ buffer เมื่อค่าถูกเปลี่ยนจากภายนอก (เช่น กดสุ่มโจทย์)
  useEffect(() => setNumText(String(numerator)), [numerator]);
  useEffect(() => setDenText(String(denominator)), [denominator]);

  // Split colorClass into parts for input vs line
  const parts = colorClass.split(" ");
  const lineBg = parts.find((p) => p.startsWith("bg-")) ?? "bg-pink-600";
  const inputColor = parts.filter((p) => !p.startsWith("bg-")).join(" ");

  const inputCls = cn(
    "block rounded-xl border-2 bg-white text-center font-extrabold transition",
    "focus:outline-none focus:ring-2",
    s.box,
    inputColor,
  );

  function handleNum(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    setNumText(digits);
    if (digits === "") return;
    const v = parseInt(digits, 10);
    if (v >= minNumerator && v <= maxNumerator && v !== numerator) onChange(v, denominator);
  }

  function handleDen(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    setDenText(digits);
    if (digits === "") return;
    const v = parseInt(digits, 10);
    if (v >= minDenominator && v <= maxDenominator && v !== denominator) onChange(numerator, v);
  }

  return (
    <div className={cn("inline-flex flex-col items-center", className)}>
      {/* ── ตัวเศษ (บน) ── */}
      <input
        type="text"
        inputMode="numeric"
        value={numText}
        onChange={(e) => handleNum(e.target.value)}
        onBlur={() => setNumText(String(numerator))}
        aria-label="ตัวเศษ"
        className={inputCls}
      />
      {/* ── เส้นคั่น ── */}
      <div className={cn("rounded-full", s.line, lineBg)} />
      {/* ── ตัวส่วน (ล่าง) ── */}
      <input
        type="text"
        inputMode="numeric"
        value={denText}
        onChange={(e) => handleDen(e.target.value)}
        onBlur={() => setDenText(String(denominator))}
        aria-label="ตัวส่วน"
        className={inputCls}
      />
    </div>
  );
}
