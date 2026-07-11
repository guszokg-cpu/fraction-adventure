import { FractionShape } from "@/components/fractions/FractionShape";
import { cn } from "@/lib/cn";
import type { FractionTone } from "@/types/lessonContent";

type FractionProps = {
  top: string | number;
  bottom: string | number;
  className?: string;
};

export function FractionStack({ top, bottom, className }: FractionProps) {
  return (
    <span className={cn("inline-flex min-w-8 flex-col items-center align-middle font-extrabold leading-none", className)}>
      <span>{top}</span>
      <span className="my-1 h-0.5 w-full rounded-full bg-current" />
      <span>{bottom}</span>
    </span>
  );
}

type StepBadgeProps = {
  children: React.ReactNode;
};

export function StepBadge({ children }: StepBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">
      {children}
    </span>
  );
}

type SectionHeaderProps = {
  number: number;
  title: string;
};

export function SectionHeader({ number, title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-700 to-sky-500 px-4 py-2.5 text-white">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-sm font-extrabold">{number}</span>
      <h2 className="text-lg font-extrabold">{title}</h2>
    </div>
  );
}

type TwoToneBarProps = {
  a: number;
  b: number;
  denominator: number;
  className?: string;
};

/** แท่งเดียวแบ่ง denominator ช่อง — a ช่องแรกสีฟ้า, b ช่องถัดมาสีม่วง (แสดงผลการรวมสองเศษส่วน) */
export function TwoToneBar({ a, b, denominator, className }: TwoToneBarProps) {
  const width = 100 / denominator;
  return (
    <div className={cn("grid place-items-center", className)}>
      <svg viewBox="0 0 100 26" className="h-full w-full" role="img" aria-label={`${a} บวก ${b} จาก ${denominator} ส่วน`}>
        {Array.from({ length: denominator }, (_, i) => (
          <rect
            key={i}
            x={i * width}
            y={0}
            width={width}
            height={26}
            fill={i < a ? "#38bdf8" : i < a + b ? "#a78bfa" : "#ffffff"}
            stroke="#312e81"
            strokeWidth={1.2}
          />
        ))}
      </svg>
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

export function MiniFractionBar({ numerator, denominator, tone = "sky", label, className }: MiniFractionBarProps) {
  return (
    <div className={cn("rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-blue-100", className)}>
      <FractionShape numerator={numerator} denominator={denominator} shape="bar" tone={tone} className="mx-auto h-10 w-full" />
      {label ? <div className="mt-2 text-sm font-extrabold text-brand-900">{label}</div> : null}
    </div>
  );
}
