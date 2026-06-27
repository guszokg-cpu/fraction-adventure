import type {
  FractionShapeKind,
  FractionQuizQuestion,
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

export const fractionMeaningSteps = [
  {
    id: "whole",
    icon: "1",
    title: "เริ่มจาก 1 หน่วย",
    description: "เช่น พิซซ่า 1 ถาด แถบกระดาษ 1 เส้น หรือรูป 1 รูป"
  },
  {
    id: "equal-parts",
    icon: "2",
    title: "แบ่งเป็นส่วนเท่า ๆ กัน",
    description: "ทุกส่วนต้องมีขนาดเท่ากันก่อนจึงจะเขียนเป็นเศษส่วนได้"
  },
  {
    id: "selected",
    icon: "3",
    title: "นับส่วนที่เลือก",
    description: "ส่วนที่ระบายหรือเลือกไว้คือ ตัวเศษ"
  }
];

export const fractionIntroQuiz: FractionQuizQuestion[] = [
  {
    id: "q1",
    prompt: "ภาพนี้แสดงเศษส่วนใด?",
    numerator: 1,
    denominator: 2,
    shape: "circle",
    tone: "sky",
    choices: ["1/2", "1/3", "2/1"],
    answer: "1/2",
    explanation: "ถูกต้อง เพราะระบาย 1 ส่วน จากทั้งหมด 2 ส่วนที่เท่ากัน"
  },
  {
    id: "q2",
    prompt: "ถ้าแบ่งเป็น 4 ส่วนเท่ากัน และระบาย 3 ส่วน ควรเขียนอย่างไร?",
    numerator: 3,
    denominator: 4,
    shape: "bar",
    tone: "emerald",
    choices: ["4/3", "3/4", "1/4"],
    answer: "3/4",
    explanation: "ตัวเศษคือ 3 ส่วนที่ระบาย ตัวส่วนคือ 4 ส่วนทั้งหมด"
  },
  {
    id: "q3",
    prompt: "ภาพนี้อ่านว่าอะไร?",
    numerator: 5,
    denominator: 8,
    shape: "grid",
    tone: "violet",
    choices: ["เศษห้าส่วนแปด", "เศษแปดส่วนห้า", "เศษสามส่วนแปด"],
    answer: "เศษห้าส่วนแปด",
    explanation: "อ่านตัวเศษก่อน แล้วอ่านตัวส่วนตามหลัง"
  }
];

export const fractionIntroMissions: LessonMissionItem[] = [
  { id: "m1", icon: "🍕", title: "ระบายสีให้ตรงเศษส่วน", current: 0, target: 5 },
  { id: "m2", icon: "🔍", title: "ทายเศษส่วนจากภาพ", current: 0, target: 5 },
  { id: "m3", icon: "🧩", title: "จับคู่ตัวเศษตัวส่วน", current: 0, target: 5 },
  { id: "m4", icon: "✅", title: "ถูกหรือผิด แบ่งเท่ากันไหม", current: 0, target: 5 }
];

export const builderDenominators: number[] = [2, 3, 4, 5, 6, 8, 10, 12];

export const builderShapes: { id: FractionShapeKind; label: string; icon: string }[] = [
  { id: "circle", label: "วงกลม", icon: "⏺" },
  { id: "bar", label: "แท่ง", icon: "▭" },
  { id: "grid", label: "ตาราง", icon: "▦" },
  { id: "pizza", label: "พิซซา", icon: "🍕" },
  { id: "watermelon", label: "แตงโม", icon: "🍉" },
  { id: "glass", label: "แก้วน้ำ", icon: "🥛" },
  { id: "chocolate", label: "ช็อกโกแลต", icon: "🍫" }
];
