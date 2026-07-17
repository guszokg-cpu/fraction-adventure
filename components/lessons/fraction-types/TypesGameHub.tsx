"use client";

import { LessonGameHub } from "@/components/games/LessonGameHub";

export function TypesGameHub() {
  return (
    <LessonGameHub
      slug="read-write"
      stepNo={7}
      title="โซนเกมประเภทของเศษส่วน 🎮"
      headerGradient="bg-gradient-to-r from-amber-600 to-orange-500"
      theme="amber"
      intro="เลือกเกมที่อยากเล่น — แยกเศษส่วนแท้ เศษเกิน จำนวนคละ ให้แม่นเป๊ะ! (แต่งตัวละครของตัวเองได้ด้วย)"
    />
  );
}
