import type { LessonExample, LessonMeta, LessonMissionItem, LessonTip } from "@/types/lessonContent";

export const fractionFromImageMeta: LessonMeta = {
  order: 3,
  total: 12,
  progress: 33,
  stars: 1,
  maxStars: 4,
  prevHref: "/lessons/read-write",
  nextHref: "/lessons/number-line",
  nextLabel: "เศษส่วนบนเส้นจำนวน",
  heroImage: "/images/heroes/fraction-from-image.png",
  themeColor: "sky",
};

export const fractionFromImageTips: LessonTip[] = [
  { id: "tip-total", icon: "1️⃣", text: "นับจำนวนส่วนทั้งหมดก่อน" },
  { id: "tip-colored", icon: "2️⃣", text: "นับจำนวนส่วนที่ระบายสี" },
  { id: "tip-write", icon: "3️⃣", text: "เขียนจำนวนที่ระบายไว้ข้างบน และจำนวนทั้งหมดไว้ข้างล่าง" }
];

export const fractionFromImageExamples: LessonExample[] = [
  { id: "circle-3-4", numerator: 3, denominator: 4, label: "วงกลม 3/4", tone: "pink" },
  { id: "bar-3-4", numerator: 3, denominator: 4, label: "แท่ง 3/4", tone: "sky" },
  { id: "grid-3-4", numerator: 3, denominator: 4, label: "ตาราง 3/4", tone: "emerald" }
];

export const fractionFromImageMissions: LessonMissionItem[] = [
  { id: "m1", icon: "🖼️", title: "ทายภาพ 5 ข้อ", current: 3, target: 5 },
  { id: "m2", icon: "🔗", title: "จับคู่ภาพกับเศษส่วน 5 ข้อ", current: 2, target: 5 },
  { id: "m3", icon: "🎨", title: "ระบายสี 5 ข้อ", current: 1, target: 5 }
];

export const fractionFromImageActivities = [
  { id: "guess", icon: "🔍", title: "ทายภาพ", desc: "ดูภาพแล้วเลือกเศษส่วนที่ถูกต้อง" },
  { id: "match", icon: "🧩", title: "จับคู่ภาพกับเศษส่วน", desc: "จับคู่รูปภาพกับคำตอบ เช่น 3/4" },
  { id: "paint", icon: "🎨", title: "ระบายสีเอง", desc: "เลือกจำนวนส่วน แล้วระบายให้ตรงโจทย์" },
  { id: "choose", icon: "✅", title: "เลือกภาพที่ถูกต้อง", desc: "หาให้เจอว่าภาพใดแสดงเศษส่วนที่กำหนด" },
  { id: "timer", icon: "⏱️", title: "เกมจับเวลา", desc: "ตอบให้ไวภายในเวลาที่กำหนด" }
];

export const imageFractionSteps = [
  {
    id: "total",
    title: "ขั้นที่ 1 นับจำนวนส่วนทั้งหมด",
    description: "วงกลมถูกแบ่งเป็น 4 ส่วนเท่า ๆ กัน ดังนั้นตัวส่วนคือ 4",
    badge: "4 ส่วน"
  },
  {
    id: "colored",
    title: "ขั้นที่ 2 นับจำนวนส่วนที่ระบายสี",
    description: "มีส่วนที่ระบายสี 3 ส่วน ดังนั้นตัวเศษคือ 3",
    badge: "3 ส่วน"
  },
  {
    id: "write",
    title: "ขั้นที่ 3 เขียนเป็นเศษส่วน",
    description: "เขียนจำนวนที่ระบายไว้ด้านบน และจำนวนทั้งหมดไว้ด้านล่าง",
    badge: "3/4"
  }
];
