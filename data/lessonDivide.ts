import type { LessonMeta, LessonMissionItem } from "@/types/lessonContent";

export const divideLessonMeta: LessonMeta = {
  order: 12,
  total: 12,
  progress: 78,
  stars: 2,
  maxStars: 3,
  prevHref: "/lessons/multiply",
  nextHref: "/lessons/word-problems",
  nextLabel: "รับรางวัล",
  heroImage: "/images/heroes/divide.png",
  themeColor: "violet",
};

export const divideLessonMissions: LessonMissionItem[] = [
  { id: "fraction", icon: "📚", title: "หารเศษส่วน 5 ข้อ", current: 3, target: 5 },
  { id: "whole", icon: "🧩", title: "จำนวนเต็ม ÷ เศษส่วน 5 ข้อ", current: 2, target: 5 },
  { id: "mixed", icon: "🏁", title: "จำนวนคละ ÷ เศษส่วน 3 ข้อ", current: 1, target: 3 }
];
