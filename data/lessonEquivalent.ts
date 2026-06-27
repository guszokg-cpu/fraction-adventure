import type { LessonMeta, LessonMissionItem } from "@/types/lessonContent";

export const equivalentLessonMeta: LessonMeta = {
  order: 7,
  total: 14,
  progress: 52,
  stars: 2,
  maxStars: 3,
  prevHref: "/lessons/compare",
  nextHref: "/lessons/simplify-expand",
  nextLabel: "ย่อและขยายเศษส่วน"
};

export const equivalentMissions: LessonMissionItem[] = [
  { id: "match", icon: "🔗", title: "จับคู่เศษส่วนที่เท่ากัน 5 ข้อ", current: 3, target: 5 },
  { id: "create", icon: "✨", title: "สร้างเศษส่วนที่เท่ากัน 5 ข้อ", current: 2, target: 5 },
  { id: "number-line", icon: "📏", title: "หาเศษส่วนบนเส้นจำนวน 3 ข้อ", current: 1, target: 3 }
];

export const equivalentActivities = [
  { id: "match", order: 1, icon: "🔗", title: "ลากจับคู่", desc: "จับคู่เศษส่วนที่มีค่าเท่ากัน" },
  { id: "build", order: 2, icon: "✨", title: "สร้างเศษส่วนใหม่", desc: "คูณบนล่างด้วยจำนวนเดียวกัน" },
  { id: "reduce", order: 3, icon: "🔎", title: "ย่อกลับ", desc: "หารบนล่างด้วยจำนวนเดียวกัน" },
  { id: "line", order: 4, icon: "📏", title: "เส้นจำนวน", desc: "ดูตำแหน่งเดียวกันบนเส้นจำนวน" },
  { id: "speed", order: 5, icon: "⏱️", title: "เกมจับเวลา", desc: "เลือกคู่ที่เท่ากันให้ไว" }
];
