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
    <div className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-400 px-4 py-2.5 text-white">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-sm font-extrabold">{number}</span>
      <h2 className="text-lg font-extrabold">{title}</h2>
    </div>
  );
}

type StepBadgeProps = {
  children: React.ReactNode;
};

export function StepBadge({ children }: StepBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-extrabold text-orange-700">
      {children}
    </span>
  );
}

type MiniFractionBarProps = {
  numerator: number;
  denominator: number;
  tone?: FractionTone;
  label?: React.ReactNode;
  className?: string;
};

export function MiniFractionBar({ numerator, denominator, tone = "accent", label, className }: MiniFractionBarProps) {
  return (
    <div className={cn("rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-orange-100", className)}>
      <FractionShape numerator={numerator} denominator={denominator} shape="bar" tone={tone} className="mx-auto h-10 w-full" />
      {label ? <div className="mt-2 text-sm font-extrabold text-brand-900">{label}</div> : null}
    </div>
  );
}
