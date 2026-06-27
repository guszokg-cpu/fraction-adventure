import type { LessonMeta, LessonMissionItem } from "@/types/lessonContent";

export const subtractLessonMeta: LessonMeta = {
  order: 10,
  total: 12,
  progress: 65,
  stars: 2,
  maxStars: 3,
  prevHref: "/lessons/add",
  nextHref: "/lessons/multiply",
  nextLabel: "คูณเศษส่วน",
  heroImage: "/images/heroes/subtract.png",
  themeColor: "emerald",
};

export const subtractTypeOptions = [
  {
    id: "same",
    order: 1,
    title: "ตัวส่วนเท่ากัน",
    expression: "4/5 - 2/5",
    hint: "ลบเฉพาะตัวเศษ",
    tone: "emerald" as const
  },
  {
    id: "different",
    order: 2,
    title: "ตัวส่วนไม่เท่ากัน",
    expression: "3/4 - 1/2",
    hint: "ทำส่วนให้เท่ากันก่อน",
    tone: "sky" as const
  },
  {
    id: "mixed",
    order: 3,
    title: "จำนวนคละ",
    expression: "2 3/4 - 1 1/4",
    hint: "ลบจำนวนเต็ม + ลบเศษส่วน",
    tone: "violet" as const
  }
];

export const subtractLessonMissions: LessonMissionItem[] = [
  { id: "same-denominator", icon: "📗", title: "ลบตัวส่วนเท่ากัน 5 ข้อ", current: 3, target: 5 },
  { id: "different-denominator", icon: "📘", title: "ลบตัวส่วนไม่เท่ากัน 5 ข้อ", current: 2, target: 5 },
  { id: "mixed-number", icon: "🏃", title: "ลบจำนวนคละ 3 ข้อ", current: 1, target: 3 }
];

export const subtractPracticeActivities = [
  { id: "fill", order: 1, icon: "✏️", title: "เติมคำตอบ", desc: "หาผลลบให้ถูกต้อง" },
  { id: "remove", order: 2, icon: "🧽", title: "ลากภาพที่เหลือ", desc: "เอาส่วนออกแล้วดูที่เหลือ" },
  { id: "choice", order: 3, icon: "✅", title: "เลือกคำตอบ", desc: "เลือกผลลัพธ์ที่ถูกต้อง" },
  { id: "match", order: 4, icon: "🔗", title: "จับคู่โจทย์กับคำตอบ", desc: "จับคู่โจทย์กับคำตอบ" },
  { id: "speed", order: 5, icon: "⏱️", title: "เกมความเร็ว 60 วินาที", desc: "ลบให้ไว เก็บดาว" }
];
