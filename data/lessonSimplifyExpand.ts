import type { LessonMeta, LessonMissionItem } from "@/types/lessonContent";

export const simplifyExpandMeta: LessonMeta = {
  order: 7,
  total: 12,
  progress: 60,
  stars: 3,
  maxStars: 4,
  prevHref: "/lessons/equivalent",
  nextHref: "/lessons/mixed-improper",
  nextLabel: "จำนวนคละและเศษเกิน",
  heroImage: "/images/heroes/simplify-expand.png",
  themeColor: "indigo",
};

export const simplifyExpandMissions: LessonMissionItem[] = [
  { id: "m1", icon: "🔎", title: "หาเศษส่วนอย่างต่ำ 5 ข้อ", current: 1, target: 5 },
  { id: "m2", icon: "🧩", title: "จับคู่ครอบครัวให้ครบ", current: 0, target: 1 },
];
