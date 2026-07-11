import type { LessonMeta, LessonMissionItem } from "@/types/lessonContent";

export const mixedImproperMeta: LessonMeta = {
  order: 8,
  total: 12,
  progress: 55,
  stars: 2,
  maxStars: 4,
  prevHref: "/lessons/simplify-expand",
  nextHref: "/lessons/add",
  nextLabel: "บวกเศษส่วน",
  heroImage: "/images/heroes/mixed-improper.png",
  themeColor: "orange",
};

export const mixedImproperMissions: LessonMissionItem[] = [
  { id: "m1", icon: "🔄", title: "แปลงเศษเกินเป็นจำนวนคละ 5 ข้อ", current: 3, target: 5 },
  { id: "m2", icon: "🔃", title: "แปลงจำนวนคละเป็นเศษเกิน 5 ข้อ", current: 2, target: 5 },
  { id: "m3", icon: "📏", title: "ตำแหน่งบนเส้นจำนวน 5 ข้อ", current: 1, target: 5 }
];
