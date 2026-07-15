"use client";

import { LessonGameHub } from "@/components/games/LessonGameHub";

export function SubtractGameHub() {
  return (
    <LessonGameHub
      slug="subtract"
      stepNo={9}
      title="โซนเกมการลบเศษส่วน 🎮"
      headerGradient="bg-gradient-to-r from-sky-500 to-cyan-500"
      theme="sky"
      intro="เลือกเกมที่อยากเล่น — ฝึกลบเศษส่วนให้เห็นภาพและแม่นขึ้น!"
    />
  );
}
