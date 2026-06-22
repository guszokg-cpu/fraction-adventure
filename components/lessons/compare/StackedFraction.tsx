import { cn } from "@/lib/cn";

type StackedFractionProps = {
  numerator: number | string;
  denominator: number | string;
  className?: string;
  toneClassName?: string;
};

/** แสดงเศษส่วนแบบตัวเศษอยู่บน ตัวส่วนอยู่ล่าง พร้อมเส้นคั่น */
export function StackedFraction({
  numerator,
  denominator,
  className,
  toneClassName = "text-brand-900"
}: StackedFractionProps) {
  return (
    <span className={cn("inline-flex flex-col items-center leading-none", toneClassName, className)}>
      <span className="font-extrabold">{numerator}</span>
      <span className="my-1 h-0.5 w-[1.4em] rounded bg-current" />
      <span className="font-extrabold">{denominator}</span>
    </span>
  );
}
