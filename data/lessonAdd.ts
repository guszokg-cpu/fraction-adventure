import type { LessonMeta, LessonMissionItem } from "@/types/lessonContent";

export const addLessonMeta: LessonMeta = {
  order: 9,
  total: 12,
  progress: 60,
  stars: 2,
  maxStars: 3,
  prevHref: "/lessons/mixed-improper",
  nextHref: "/lessons/subtract",
  nextLabel: "ลบเศษส่วน",
  heroImage: "/images/heroes/add.png",
  themeColor: "blue",
};

export const addTypeOptions = [
  {
    id: "same",
    order: 1,
    title: "ตัวส่วนเท่ากัน",
    expression: "2/5 + 1/5",
    hint: "ง่ายที่สุด!",
    tone: "sky" as const
  },
  {
    id: "different",
    order: 2,
    title: "ตัวส่วนไม่เท่ากัน",
    expression: "1/2 + 1/3",
    hint: "ทำส่วนให้เท่ากันก่อน",
    tone: "emerald" as const
  },
  {
    id: "mixed",
    order: 3,
    title: "จำนวนคละ",
    expression: "1 1/4 + 2 1/4",
    hint: "บวกจำนวนเต็ม + บวกเศษส่วน",
    tone: "pink" as const
  }
];

export const addLessonMissions: LessonMissionItem[] = [
  { id: "same-denominator", icon: "📖", title: "บวกตัวส่วนเท่ากัน 5 ข้อ", current: 3, target: 5 },
  { id: "different-denominator", icon: "📚", title: "บวกตัวส่วนไม่เท่ากัน 5 ข้อ", current: 2, target: 5 },
  { id: "mixed-number", icon: "🧩", title: "บวกจำนวนคละ 3 ข้อ", current: 1, target: 3 }
];

export const addPracticeActivities = [
  { id: "fill", order: 1, icon: "✏️", title: "เติมคำตอบ", desc: "เติมผลบวกให้ถูกต้อง" },
  { id: "drag", order: 2, icon: "🧲", title: "ลากภาพมารวมกัน", desc: "รวมแถบเศษส่วนด้วยภาพ" },
  { id: "choice", order: 3, icon: "✅", title: "เลือกคำตอบ", desc: "เลือกผลลัพธ์ที่ถูกต้อง" },
  { id: "match", order: 4, icon: "🔗", title: "จับคู่โจทย์กับคำตอบ", desc: "จับคู่ให้สัมพันธ์กัน" },
  { id: "speed", order: 5, icon: "⏱️", title: "เกมความเร็ว 60 วินาที", desc: "คิดเร็ว เก็บดาว" }
];
