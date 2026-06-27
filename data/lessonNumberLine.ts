import type {
  FractionTone,
  LessonExample,
  LessonMeta,
  LessonMissionItem,
  LessonTip
} from "@/types/lessonContent";

export const numberLineMeta: LessonMeta = {
  order: 5,
  total: 12,
  progress: 42,
  stars: 1,
  maxStars: 4,
  prevHref: "/lessons/fraction-from-image",
  nextHref: "/lessons/compare",
  nextLabel: "เปรียบเทียบเศษส่วน"
};

export const numberLineTips: LessonTip[] = [
  { id: "tip-denominator", icon: "1️⃣", text: "ตัวส่วนบอกว่าต้องแบ่งช่วง 0 ถึง 1 ออกเป็นกี่ช่อง" },
  { id: "tip-numerator", icon: "2️⃣", text: "ตัวเศษบอกว่าให้นับจาก 0 ไปกี่ช่อง" },
  { id: "tip-mark", icon: "3️⃣", text: "จุดที่หยุดคือตำแหน่งของเศษส่วนนั้นบนเส้นจำนวน" }
];

export const numberLineExamples: LessonExample[] = [
  { id: "one-half", numerator: 1, denominator: 2, label: "อยู่กึ่งกลางพอดี", tone: "sky" },
  { id: "two-fifths", numerator: 2, denominator: 5, label: "นับไป 2 ช่อง", tone: "emerald" },
  { id: "three-quarters", numerator: 3, denominator: 4, label: "ใกล้เลข 1", tone: "pink" }
];

export const numberLineMissions: LessonMissionItem[] = [
  { id: "m1", icon: "📍", title: "หาตำแหน่งบนเส้นจำนวน 5 ข้อ", current: 2, target: 5 },
  { id: "m2", icon: "🔢", title: "อ่านจุดเป็นเศษส่วน 5 ข้อ", current: 1, target: 5 },
  { id: "m3", icon: "🎯", title: "วางจุดให้ตรงเศษส่วน 5 ข้อ", current: 1, target: 5 }
];

export const numberLineActivities = [
  { id: "place", icon: "📍", title: "หาตำแหน่ง", desc: "ดูเศษส่วนแล้ววางจุดบนเส้นให้ถูก" },
  { id: "read", icon: "🔍", title: "อ่านจุด", desc: "ดูจุดบนเส้นจำนวนแล้วบอกว่าเป็นเศษส่วนใด" },
  { id: "match", icon: "🧩", title: "จับคู่", desc: "จับคู่เศษส่วนกับตำแหน่งที่ถูกต้อง" },
  { id: "order", icon: "⚖️", title: "เทียบจุด", desc: "ดูว่าจุดใดอยู่ก่อนหรือหลังบนเส้น" },
  { id: "timer", icon: "⏱️", title: "เกมจับเวลา", desc: "ตอบให้ไวภายในเวลาที่กำหนด" }
];

export const numberLineSteps = [
  {
    id: "denominator",
    title: "ขั้นที่ 1 ดูตัวส่วน",
    description: "ตัวส่วนคือ 4 จึงแบ่งช่วงจาก 0 ถึง 1 ออกเป็น 4 ช่องเท่า ๆ กัน",
    badge: "แบ่ง 4 ช่อง"
  },
  {
    id: "numerator",
    title: "ขั้นที่ 2 ดูตัวเศษ",
    description: "ตัวเศษคือ 3 จึงนับจากเลข 0 ไปทางขวา 3 ช่อง",
    badge: "นับ 3 ช่อง"
  },
  {
    id: "mark",
    title: "ขั้นที่ 3 ทำเครื่องหมาย",
    description: "จุดที่นับมาหยุดได้ คือตำแหน่งของ 3/4 บนเส้นจำนวน",
    badge: "3/4"
  }
];

export type NumberLineExampleStrip = {
  id: string;
  numerator: number;
  denominator: number;
  tone: FractionTone;
  caption: string;
};

export const numberLineExampleStrips: NumberLineExampleStrip[] = [
  { id: "s-1-2", numerator: 1, denominator: 2, tone: "sky", caption: "อยู่กึ่งกลางระหว่าง 0 กับ 1" },
  { id: "s-3-4", numerator: 3, denominator: 4, tone: "pink", caption: "อยู่ใกล้เลข 1" },
  { id: "s-2-5", numerator: 2, denominator: 5, tone: "emerald", caption: "อยู่ก่อนกึ่งกลางเล็กน้อย" },
  { id: "s-5-6", numerator: 5, denominator: 6, tone: "violet", caption: "เกือบถึงเลข 1" }
];
