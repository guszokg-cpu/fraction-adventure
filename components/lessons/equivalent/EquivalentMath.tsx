import React from "react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { cn } from "@/lib/cn";
import type { FractionTone } from "@/types/lessonContent";

type FractionStackProps = {
  top: string | number;
  bottom: string | number;
  className?: string;
};

export function FractionStack({ top, bottom, className }: FractionStackProps) {
  return (
    <span className={cn("inline-flex min-w-8 flex-col items-center align-middle font-extrabold leading-none", className)}>
      <span>{top}</span>
      <span className="my-1 h-0.5 w-full rounded-full bg-current" />
      <span>{bottom}</span>
    </span>
  );
}

type SectionHeaderProps = {
  number: number;
  title: string;
};

export function SectionHeader({ number, title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-violet-500 px-4 py-2.5 text-white">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-sm font-extrabold">{number}</span>
      <h2 className="text-lg font-extrabold">{title}</h2>
    </div>
  );
}

type MiniFractionBarProps = {
  numerator: number;
  denominator: number;
  tone?: FractionTone;
  label?: React.ReactNode;
  className?: string;
};

export function MiniFractionBar({ numerator, denominator, tone = "emerald", label, className }: MiniFractionBarProps) {
  return (
    <div className={cn("rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-teal-100", className)}>
      <FractionShape numerator={numerator} denominator={denominator} shape="bar" tone={tone} className="mx-auto h-10 w-full" />
      <div className="mt-2 text-lg font-extrabold text-brand-900">{label}</div>
    </div>
  );
}

export function NumberLineEquivalent() {
  const marks: { key: string; left: string; display: React.ReactNode }[] = [
    { key: "0",    left: "0%",   display: "0" },
    { key: "half", left: "50%",  display: <FractionStack top={1} bottom={2} className="text-xs" /> },
    { key: "1",    left: "100%", display: "1" },
  ];

  return (
    <div className="relative mx-auto h-24 w-full max-w-lg px-6">
      <div className="absolute left-6 right-6 top-10 h-1 rounded-full bg-slate-300" />
      {marks.map((mark) => (
        <div key={mark.key} className="absolute top-7 -translate-x-1/2 text-center" style={{ left: `calc(1.5rem + (${mark.left}) * 0.88)` }}>
          <div className="mx-auto h-7 w-1 rounded-full bg-brand-800" />
          <div className="mt-1 text-sm font-extrabold text-brand-900">{mark.display}</div>
        </div>
      ))}
      <div className="absolute top-6 h-9 w-9 -translate-x-1/2 rounded-full border-4 border-white bg-violet-500 shadow-lg" style={{ left: "50%" }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-violet-50 px-4 py-1 text-sm font-extrabold text-violet-700">
        <FractionStack top={1} bottom={2} className="text-sm" /> = <FractionStack top={2} bottom={4} className="text-sm" /> = <FractionStack top={3} bottom={6} className="text-sm" />
      </div>
    </div>
  );
}
