import { readThaiFraction, readThaiNumber } from "./thaiNumber";
import { randInt } from "./randomFraction";

/** ห้อยจำนวนเต็มบวกที่หารร่วมมากของ a, b (Euclidean algorithm) */
export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y) {
    [x, y] = [y, x % y];
  }
  return x || 1;
}

export type SimpleFraction = { numerator: number; denominator: number };

/** ย่อเศษส่วนให้เป็นรูปอย่างต่ำ — ถ้าตัวเศษเป็น 0 ให้คงตัวส่วนเดิมไว้ (0/4 อ่านง่ายกว่า 0/1) */
export function simplifyFraction(numerator: number, denominator: number): SimpleFraction {
  const safeDenominator = Math.max(1, denominator);
  if (numerator === 0) return { numerator: 0, denominator: safeDenominator };
  const d = gcd(numerator, safeDenominator);
  return { numerator: numerator / d, denominator: safeDenominator / d };
}

export type MixedNumber = { whole: number; numerator: number; denominator: number };

/** แปลงเศษเกินเป็นจำนวนคละ (whole + เศษส่วนแท้) */
export function toMixedNumber(numerator: number, denominator: number): MixedNumber {
  const safeDenominator = Math.max(1, denominator);
  const whole = Math.floor(numerator / safeDenominator);
  const remainder = numerator % safeDenominator;
  return { whole, numerator: remainder, denominator: safeDenominator };
}

/** แบ่ง totalNumerator ออกเป็นจำนวนเศษของแต่ละรูป (รูปละไม่เกิน denominator) เช่น total=7, d=4 → [4, 3] */
export function splitIntoShapeNumerators(totalNumerator: number, denominator: number): number[] {
  const parts: number[] = [];
  let remaining = totalNumerator;
  while (remaining > 0) {
    const take = Math.min(denominator, remaining);
    parts.push(take);
    remaining -= take;
  }
  return parts.length ? parts : [0];
}

/** นับจำนวนส่วนที่ถูกระบายทั้งหมดจากทุกรูป */
export function countColoredParts(coloredParts: boolean[][]): number {
  return coloredParts.reduce((sum, shapeParts) => sum + shapeParts.filter(Boolean).length, 0);
}

/** คำอ่านเศษส่วนพื้นฐาน เช่น 3/4 → "เศษสามส่วนสี่" (รองรับตัวเลขทุกขนาด ไม่จำกัดแค่ 0-12) */
export function getThaiFractionReading(numerator: number, denominator: number): string {
  return readThaiFraction(numerator, denominator);
}

/** คำอ่านจำนวนคละ เช่น 1, 3/4 → "หนึ่งเศษสามส่วนสี่" */
export function getThaiMixedNumberReading(whole: number, numerator: number, denominator: number): string {
  if (numerator === 0) return readThaiNumber(whole);
  return `${readThaiNumber(whole)}${getThaiFractionReading(numerator, denominator)}`;
}

// ─── กิจกรรมฝึกทักษะ: สร้างภาพจากโจทย์เศษส่วน ────────────────────────────────

export type FractionKind = "proper" | "improper" | "mixed";

export type DrawChallenge = {
  kind: FractionKind;
  numerator: number;
  denominator: number;
  /** จำนวนรูปที่จัดเตรียมให้ผู้เรียน — คำนวณจากจำนวนรูปขั้นต่ำที่ทำโจทย์ได้ บวกเผื่อไว้อีก 1 รูป */
  shapeCount: number;
};

const CHALLENGE_DENOMINATORS = [2, 3, 4, 5, 6, 8];

/** สุ่มโจทย์เศษส่วนสำหรับกิจกรรม "สร้างภาพจากโจทย์" — ล็อกตัวส่วนและจำนวนรูปให้ทำโจทย์ได้เสมอ */
export function generateDrawChallenge(allowedKinds: FractionKind[]): DrawChallenge {
  const kinds = allowedKinds.length > 0 ? allowedKinds : (["proper"] as FractionKind[]);
  const kind = kinds[randInt(0, kinds.length - 1)];
  const denominator = CHALLENGE_DENOMINATORS[randInt(0, CHALLENGE_DENOMINATORS.length - 1)];

  let numerator: number;
  let minShapeCount: number;

  if (kind === "proper") {
    numerator = randInt(1, denominator - 1);
    minShapeCount = 1;
  } else if (kind === "improper") {
    const whole = randInt(1, 3);
    const remainder = randInt(0, denominator - 1);
    numerator = whole * denominator + remainder;
    minShapeCount = remainder > 0 ? whole + 1 : whole;
  } else {
    const whole = randInt(1, 3);
    const remainder = randInt(1, denominator - 1);
    numerator = whole * denominator + remainder;
    minShapeCount = whole + 1;
  }

  const shapeCount = Math.min(5, Math.max(1, minShapeCount) + 1);
  return { kind, numerator, denominator, shapeCount };
}
