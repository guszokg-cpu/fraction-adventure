"use client";

import { LessonGameHub } from "@/components/games/LessonGameHub";

export function MultiplyGameHub() {
  return (
    <LessonGameHub
      slug="multiply"
      stepNo={10}
      title="โซนเกมการคูณเศษส่วน 🎮"
      headerGradient="bg-gradient-to-r from-amber-600 to-orange-500"
      theme="amber"
      intro="เลือกเกมที่อยากเล่น — สร้างโจทย์ปัญหาการคูณจากชีวิตจริง แล้วพิสูจน์คำตอบให้เห็นภาพ!"
    />
  );
}
