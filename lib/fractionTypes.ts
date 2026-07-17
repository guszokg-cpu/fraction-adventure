import { randInt } from "@/lib/randomFraction";

/* ── ประเภทเศษส่วน (ใช้ร่วมในเกมบทประเภทของเศษส่วน) ── */

export type FracType = "proper" | "improper" | "mixed";

export type TypedFraction = {
  type: FracType;
  whole: number;   // 0 ถ้าไม่ใช่จำนวนคละ
  num: number;
  den: number;
};

export const TYPE_INFO: Record<FracType, { label: string; color: string; bg: string; hint: string }> = {
  proper:   { label: "เศษส่วนแท้",  color: "#16a34a", bg: "#dcfce7", hint: "ตัวเศษ < ตัวส่วน (ค่าน้อยกว่า 1)" },
  improper: { label: "เศษเกิน",     color: "#ea580c", bg: "#ffedd5", hint: "ตัวเศษ ≥ ตัวส่วน (ค่า 1 ขึ้นไป)" },
  mixed:    { label: "จำนวนคละ",    color: "#7c3aed", bg: "#ede9fe", hint: "จำนวนเต็มควบกับเศษส่วนแท้" },
};

export const FRAC_TYPES: FracType[] = ["proper", "improper", "mixed"];

/** สุ่มเศษส่วนตามประเภทที่กำหนด */
export function makeFraction(type: FracType): TypedFraction {
  const den = randInt(2, 9);
  if (type === "proper") return { type, whole: 0, num: randInt(1, den - 1), den };
  if (type === "improper") {
    // รวมกรณี n = d (เท่ากับ 1 พอดี ก็นับเป็นเศษเกิน)
    return { type, whole: 0, num: randInt(den, den * 2), den };
  }
  return { type, whole: randInt(1, 3), num: randInt(1, den - 1), den };
}

export function randomType(): FracType {
  return FRAC_TYPES[randInt(0, FRAC_TYPES.length - 1)];
}

/** จำแนกประเภทจากค่า (ไว้ตรวจคำตอบ) */
export function classify(f: TypedFraction): FracType {
  if (f.whole > 0) return "mixed";
  return f.num < f.den ? "proper" : "improper";
}
