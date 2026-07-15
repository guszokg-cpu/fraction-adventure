"use client";

import { LessonGameHub } from "@/components/games/LessonGameHub";

export function AddGameHub() {
  return (
    <LessonGameHub
      slug="add"
      stepNo={9}
      title="โซนเกมการบวกเศษส่วน 🎮"
      headerGradient="bg-gradient-to-r from-orange-500 to-rose-500"
      theme="orange"
      intro="เลือกเกมที่อยากเล่น — ฝึกบวกเศษส่วนให้เห็นภาพและสนุกขึ้น!"
    />
  );
}
