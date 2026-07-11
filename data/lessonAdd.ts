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

export const addLessonMissions: LessonMissionItem[] = [
  { id: "same-denominator", icon: "📖", title: "บวกตัวส่วนเท่ากัน 5 ข้อ", current: 3, target: 5 },
  { id: "different-denominator", icon: "📚", title: "บวกตัวส่วนไม่เท่ากัน 5 ข้อ", current: 2, target: 5 },
  { id: "mixed-number", icon: "🧩", title: "บวกจำนวนคละ 3 ข้อ", current: 1, target: 3 }
];
