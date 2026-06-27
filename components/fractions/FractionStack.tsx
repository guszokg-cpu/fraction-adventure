import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  top: ReactNode;
  bottom: ReactNode;
  className?: string;
};

/** เศษส่วนแนวตั้ง: ตัวเศษอยู่บน เส้นคั่นกลาง ตัวส่วนอยู่ล่าง */
export function FractionStack({ top, bottom, className }: Props) {
  return (
    <span className={cn("inline-flex flex-col items-center align-middle leading-none", className)}>
      <span>{top}</span>
      <span className="my-0.5 h-0.5 w-full min-w-[1.2rem] rounded-full bg-current" />
      <span>{bottom}</span>
    </span>
  );
}
