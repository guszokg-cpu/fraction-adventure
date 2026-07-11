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

export const subtractLessonMissions: LessonMissionItem[] = [
  { id: "same-denominator", icon: "📗", title: "ลบตัวส่วนเท่ากัน 5 ข้อ", current: 3, target: 5 },
  { id: "different-denominator", icon: "📘", title: "ลบตัวส่วนไม่เท่ากัน 5 ข้อ", current: 2, target: 5 },
  { id: "mixed-number", icon: "🏃", title: "ลบจำนวนคละ 3 ข้อ", current: 1, target: 3 }
];
