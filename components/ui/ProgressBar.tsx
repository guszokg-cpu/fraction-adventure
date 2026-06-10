import { cn } from "@/lib/cn";

type ProgressBarProps = {
  value: number;
  className?: string;
};

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={cn("h-3 overflow-hidden rounded-full bg-slate-200", className)}>
      <div className="h-full rounded-full bg-gradient-to-r from-accent-400 to-brand-500" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}
