"use client";

import { LessonGameHub } from "@/components/games/LessonGameHub";

export function CompareGameHub() {
  return (
    <LessonGameHub
      slug="compare"
      stepNo={9}
      title="โซนเกมเปรียบเทียบ 🎮"
      headerGradient="bg-gradient-to-r from-emerald-600 to-green-500"
      theme="emerald"
      intro="เลือกเกมที่อยากเล่น — ฝึกเปรียบเทียบเศษส่วนให้แม่นขึ้น!"
    />
  );
}
