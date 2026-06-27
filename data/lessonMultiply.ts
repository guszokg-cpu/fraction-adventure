import type { LessonMeta, LessonMissionItem } from "@/types/lessonContent";

export const multiplyLessonMeta: LessonMeta = {
  order: 11,
  total: 12,
  progress: 62,
  stars: 2,
  maxStars: 3,
  prevHref: "/lessons/subtract",
  nextHref: "/lessons/divide",
  nextLabel: "หารเศษส่วน",
  heroImage: "/images/heroes/multiply.png",
  themeColor: "orange",
};

export const multiplyTypeOptions = [
  {
    id: "fraction",
    order: 1,
    title: "เศษส่วน × เศษส่วน",
    expression: "2/3 × 3/4",
    hint: "ดูพื้นที่ซ้อนกัน",
    tone: "violet" as const
  },
  {
    id: "whole",
    order: 2,
    title: "จำนวนเต็ม × เศษส่วน",
    expression: "3 × 2/5",
    hint: "รวมหลายกลุ่ม",
    tone: "accent" as const
  },
  {
    id: "mixed",
    order: 3,
    title: "จำนวนคละ × เศษส่วน",
    expression: "1 1/2 × 2/3",
    hint: "แปลงเป็นเศษเกินก่อน",
    tone: "emerald" as const
  }
];

export const multiplyLessonMissions: LessonMissionItem[] = [
  { id: "fraction", icon: "🧮", title: "คูณเศษส่วน 5 ข้อ", current: 3, target: 5 },
  { id: "cross-cancel", icon: "✂️", title: "ตัดทอนก่อนคูณ 5 ข้อ", current: 2, target: 5 },
  { id: "mixed", icon: "🍕", title: "คูณจำนวนคละ 3 ข้อ", current: 1, target: 3 }
];

export const multiplyPracticeActivities = [
  { id: "fill", order: 1, icon: "✏️", title: "เติมคำตอบ", desc: "คูณตัวเศษและตัวส่วน" },
  { id: "shade", order: 2, icon: "🟧", title: "ระบายพื้นที่ซ้อน", desc: "ดูพื้นที่ที่ซ้อนกัน" },
  { id: "cancel", order: 3, icon: "✂️", title: "ตัดทอนแล้วคูณ", desc: "ย่อก่อนคูณให้ง่ายขึ้น" },
  { id: "match", order: 4, icon: "🔗", title: "จับคู่โจทย์กับคำตอบ", desc: "จับคู่ผลคูณที่ถูกต้อง" },
  { id: "speed", order: 5, icon: "⏱️", title: "เกมจับเวลา", desc: "คูณให้ไวใน 60 วินาที" }
];
