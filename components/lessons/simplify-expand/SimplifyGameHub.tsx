"use client";

import { LessonGameHub } from "@/components/games/LessonGameHub";

export function SimplifyGameHub() {
  return (
    <LessonGameHub
      slug="simplify-expand"
      stepNo={10}
      title="โซนเกมเศษส่วนอย่างต่ำ 🎮"
      headerGradient="bg-gradient-to-r from-orange-500 to-amber-500"
      theme="orange"
      intro="เลือกเกมที่อยากเล่น — ฝึกย่อเศษส่วนให้เป็นอย่างต่ำ!"
    />
  );
}
