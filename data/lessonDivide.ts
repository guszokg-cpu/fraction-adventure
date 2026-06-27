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

export const divideTypeOptions = [
  {
    id: "fraction",
    order: 1,
    title: "เศษส่วน ÷ เศษส่วน",
    expression: "1/2 ÷ 1/4",
    hint: "มี 1/4 อยู่กี่กลุ่ม",
    tone: "pink" as const
  },
  {
    id: "whole",
    order: 2,
    title: "จำนวนเต็ม ÷ เศษส่วน",
    expression: "2 ÷ 1/4",
    hint: "แบ่งจำนวนเต็มเป็นชิ้น",
    tone: "accent" as const
  },
  {
    id: "mixed",
    order: 3,
    title: "จำนวนคละ ÷ เศษส่วน",
    expression: "1 1/2 ÷ 1/4",
    hint: "แปลงจำนวนคละก่อน",
    tone: "sky" as const
  }
];

export const divideLessonMissions: LessonMissionItem[] = [
  { id: "fraction", icon: "📚", title: "หารเศษส่วน 5 ข้อ", current: 3, target: 5 },
  { id: "whole", icon: "🧩", title: "จำนวนเต็ม ÷ เศษส่วน 5 ข้อ", current: 2, target: 5 },
  { id: "mixed", icon: "🏁", title: "จำนวนคละ ÷ เศษส่วน 3 ข้อ", current: 1, target: 3 }
];

export const dividePracticeActivities = [
  { id: "groups", order: 1, icon: "🔍", title: "นับกลุ่ม", desc: "ดูว่ามีกี่กลุ่มในภาพ" },
  { id: "flip", order: 2, icon: "🔄", title: "กลับตัวหลัง", desc: "ฝึกคงหน้า กลับหลัง คูณ" },
  { id: "choice", order: 3, icon: "✅", title: "เลือกคำตอบ", desc: "เลือกผลหารที่ถูกต้อง" },
  { id: "match", order: 4, icon: "🔗", title: "จับคู่โจทย์", desc: "จับคู่ภาพ สูตร และคำตอบ" },
  { id: "speed", order: 5, icon: "⏱️", title: "เกมจับเวลา", desc: "ตอบให้ไวใน 60 วินาที" }
];
