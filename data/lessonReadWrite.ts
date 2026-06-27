import type { LessonExample, LessonMeta, LessonMissionItem, LessonTip } from "@/types/lessonContent";

export const readWriteMeta: LessonMeta = {
  order: 2,
  total: 12,
  progress: 30,
  stars: 1,
  maxStars: 3,
  prevHref: "/lessons/fraction-intro",
  nextHref: "/lessons/fraction-from-image",
  nextLabel: "เศษส่วนจากภาพ",
  heroImage: "/images/heroes/read-write.png",
  themeColor: "violet",
};

export const readWriteTips: LessonTip[] = [
  { id: "tip-num", icon: "⭐", text: "ตัวเศษ = ส่วนที่เลือก" },
  { id: "tip-den", icon: "⭐", text: "ตัวส่วน = ส่วนทั้งหมด" },
  { id: "tip-read", icon: "🗣️", text: "อ่านว่า เศษ…ส่วน…" }
];

export const readWriteExamples: LessonExample[] = [
  { id: "ex-1-2", numerator: 1, denominator: 2, label: "เศษหนึ่งส่วนสอง", tone: "sky" },
  { id: "ex-3-4", numerator: 3, denominator: 4, label: "เศษสามส่วนสี่", tone: "emerald" },
  { id: "ex-5-8", numerator: 5, denominator: 8, label: "เศษห้าส่วนแปด", tone: "violet" }
];

export const readWriteMissions: LessonMissionItem[] = [
  { id: "m1", icon: "📖", title: "อ่านเศษส่วนให้ถูกต้อง", current: 0, target: 5 },
  { id: "m2", icon: "🔗", title: "จับคู่คำอ่าน", current: 0, target: 5 },
  { id: "m3", icon: "✍️", title: "เขียนเศษส่วนจากคำอ่าน", current: 0, target: 5 },
  { id: "m4", icon: "🖼️", title: "อ่านเศษส่วนจากภาพ", current: 0, target: 5 }
];

export const readPracticeFractions: { numerator: number; denominator: number }[] = [
  { numerator: 1, denominator: 2 },
  { numerator: 1, denominator: 3 },
  { numerator: 1, denominator: 4 },
  { numerator: 2, denominator: 3 },
  { numerator: 2, denominator: 5 },
  { numerator: 3, denominator: 4 },
  { numerator: 3, denominator: 5 },
  { numerator: 4, denominator: 5 },
  { numerator: 5, denominator: 6 },
  { numerator: 5, denominator: 8 }
];
