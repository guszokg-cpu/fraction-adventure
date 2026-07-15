"use client";

import { LessonGameHub } from "@/components/games/LessonGameHub";

export function EquivalentGameHub() {
  return (
    <LessonGameHub
      slug="equivalent"
      stepNo={9}
      title="โซนเกมเศษส่วนเท่ากัน 🎮"
      headerGradient="bg-gradient-to-r from-teal-600 to-violet-500"
      theme="teal"
      intro="เลือกเกมที่อยากเล่น — ฝึกหาเศษส่วนที่เท่ากันให้เห็นภาพ!"
    />
  );
}
