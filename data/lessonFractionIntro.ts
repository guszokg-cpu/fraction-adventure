import type {
  LessonExample,
  LessonMeta,
  LessonMissionItem,
  LessonTip
} from "@/types/lessonContent";

export const fractionIntroMeta: LessonMeta = {
  order: 1,
  total: 12,
  progress: 40,
  stars: 2,
  maxStars: 3,
  prevHref: "/",
  nextHref: "/lessons/read-write",
  nextLabel: "อ่านและเขียนเศษส่วน",
  heroImage: "/images/heroes/fraction-intro.png",
  themeColor: "blue",
};

export const fractionIntroTips: LessonTip[] = [
  { id: "tip-num", icon: "⭐", text: "ตัวเศษ = ส่วนที่เลือก" },
  { id: "tip-den", icon: "⭐", text: "ตัวส่วน = ส่วนทั้งหมด" },
  { id: "tip-equal", icon: "✅", text: "ส่วนทั้งหมดต้องเท่า ๆ กัน" }
];

export const fractionIntroExamples: LessonExample[] = [
  { id: "ex-1-2", numerator: 1, denominator: 2, label: "เศษหนึ่งส่วนสอง", tone: "sky" },
  { id: "ex-3-4", numerator: 3, denominator: 4, label: "เศษสามส่วนสี่", tone: "emerald" },
  { id: "ex-5-8", numerator: 5, denominator: 8, label: "เศษห้าส่วนแปด", tone: "violet" }
];

export const fractionIntroMissions: LessonMissionItem[] = [
  { id: "m1", icon: "🍕", title: "ระบายสีให้ตรงเศษส่วน", current: 0, target: 5 },
  { id: "m2", icon: "🔍", title: "ทายเศษส่วนจากภาพ", current: 0, target: 5 },
  { id: "m3", icon: "🧩", title: "จับคู่ตัวเศษตัวส่วน", current: 0, target: 5 },
  { id: "m4", icon: "✅", title: "ถูกหรือผิด แบ่งเท่ากันไหม", current: 0, target: 5 }
];
