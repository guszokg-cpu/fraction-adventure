"use client";

import { LessonGameHub } from "@/components/games/LessonGameHub";

export function MixedGameHub() {
  return (
    <LessonGameHub
      slug="mixed-improper"
      stepNo={10}
      title="โซนเกมจำนวนคละและเศษเกิน 🎮"
      headerGradient="bg-gradient-to-r from-pink-600 to-fuchsia-600"
      theme="pink"
      intro="เลือกเกมที่อยากเล่น — ฝึกแปลงจำนวนคละและเศษเกินให้คล่อง!"
    />
  );
}
