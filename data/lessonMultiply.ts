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

export const multiplyLessonMissions: LessonMissionItem[] = [
  { id: "fraction", icon: "🧮", title: "คูณเศษส่วน 5 ข้อ", current: 3, target: 5 },
  { id: "cross-cancel", icon: "✂️", title: "ตัดทอนก่อนคูณ 5 ข้อ", current: 2, target: 5 },
  { id: "mixed", icon: "🍕", title: "คูณจำนวนคละ 3 ข้อ", current: 1, target: 3 }
];
