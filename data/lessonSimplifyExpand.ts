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
  { id: "m1", icon: "✖️", title: "ขยายเศษส่วน 5 ข้อ", current: 3, target: 5 },
  { id: "m2", icon: "➗", title: "ย่อเศษส่วน 5 ข้อ", current: 2, target: 5 },
  { id: "m3", icon: "🔎", title: "หาเศษส่วนอย่างต่ำ 5 ข้อ", current: 1, target: 5 }
];

/** ลำดับการขยาย 1/2 ให้เป็นเศษส่วนเท่ากัน */
export const expandMultipliers = [2, 3, 4, 5];

/** ลำดับซูมภาพ ค่าเท่ากับ 1/2 ทั้งหมด */
export const zoomSteps = [
  { numerator: 1, denominator: 2 },
  { numerator: 2, denominator: 4 },
  { numerator: 4, denominator: 8 },
  { numerator: 8, denominator: 16 }
];

/** ตัวหารที่เป็นตัวเลือกในการ์ดหาเศษส่วนอย่างต่ำ (12/18) */
export const lowestTermOptions = [2, 3, 6, 9];

export const connectPairs = [
  { id: "p1", left: { numerator: 1, denominator: 2 }, right: { numerator: 2, denominator: 4 } },
  { id: "p2", left: { numerator: 2, denominator: 3 }, right: { numerator: 4, denominator: 6 } },
  { id: "p3", left: { numerator: 3, denominator: 5 }, right: { numerator: 6, denominator: 10 } }
];

export const speedSamples = [
  { id: "s1", from: { numerator: 8, denominator: 12 }, to: { numerator: 2, denominator: 3 } },
  { id: "s2", from: { numerator: 12, denominator: 16 }, to: { numerator: 3, denominator: 4 } },
  { id: "s3", from: { numerator: 15, denominator: 25 }, to: { numerator: 3, denominator: 5 } }
];

export const detectiveChoices = [
  { numerator: 2, denominator: 3 },
  { numerator: 3, denominator: 4 },
  { numerator: 4, denominator: 5 }
];

export const simplifyPracticeActivities = [
  { id: "expand", icon: "✖️", title: "ขยายเศษส่วน", desc: "คูณบนล่างด้วยจำนวนเดียวกัน" },
  { id: "simplify", icon: "➗", title: "ย่อเศษส่วน", desc: "หารบนล่างด้วยจำนวนเดียวกัน" },
  { id: "lowest", icon: "🔎", title: "หาเศษส่วนอย่างต่ำ", desc: "ย่อจนหารต่อไม่ได้อีก" },
  { id: "match", icon: "🧩", title: "จับคู่เศษส่วนเท่ากัน", desc: "หาคู่ที่มีค่าเท่ากัน" },
  { id: "timer", icon: "⏱️", title: "เกมจับเวลา 60 วินาที", desc: "ย่อให้ไวภายในเวลาที่กำหนด" }
];
