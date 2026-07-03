import type { LessonMeta, LessonMissionItem } from "@/types/lessonContent";

export const compareMeta: LessonMeta = {
  order: 5,
  total: 12,
  progress: 50,
  stars: 2,
  maxStars: 3,
  prevHref: "/lessons/number-line",
  nextHref: "/lessons/equivalent",
  nextLabel: "เศษส่วนที่เท่ากัน",
  heroImage: "/images/heroes/compare.png",
  themeColor: "emerald",
};

export const compareMissions: LessonMissionItem[] = [
  { id: "m1", icon: "🖼️", title: "เปรียบเทียบจากภาพ 5 ข้อ", current: 3, target: 5 },
  { id: "m2", icon: "📏", title: "เปรียบเทียบบนเส้นจำนวน 5 ข้อ", current: 2, target: 5 },
  { id: "m3", icon: "🟰", title: "ทำส่วนให้เท่ากัน 5 ข้อ", current: 1, target: 5 }
];

export type CompareTipCase = {
  id: string;
  title: string;
  rule: string;
  left: { numerator: number; denominator: number };
  right: { numerator: number; denominator: number };
  sign: ">" | "<" | "=";
};

export const compareTipCases: CompareTipCase[] = [
  {
    id: "same-denominator",
    title: "กรณี 1 ตัวส่วนเท่ากัน",
    rule: "ดูตัวเศษ ตัวเศษมากกว่า ค่ามากกว่า",
    left: { numerator: 3, denominator: 8 },
    right: { numerator: 2, denominator: 8 },
    sign: ">"
  },
  {
    id: "same-numerator",
    title: "กรณี 2 ตัวเศษเท่ากัน",
    rule: "ตัวส่วนยิ่งน้อย ค่ายิ่งมาก",
    left: { numerator: 1, denominator: 2 },
    right: { numerator: 1, denominator: 4 },
    sign: ">"
  },
  {
    id: "different",
    title: "กรณี 3 ไม่เท่ากันทั้งคู่",
    rule: "ทำส่วนให้เท่ากัน หรือใช้เส้นจำนวน",
    left: { numerator: 1, denominator: 2 },
    right: { numerator: 3, denominator: 4 },
    sign: "<"
  }
];

