"use client";

import { LessonGameHub } from "@/components/games/LessonGameHub";

export function IntroGameHub() {
  return (
    <LessonGameHub
      slug="fraction-intro"
      stepNo={10}
      title="โซนเกมรู้จักเศษส่วน 🎮"
      headerGradient="bg-gradient-to-r from-brand-700 to-indigo-500"
      theme="violet"
      intro="เลือกเกมที่อยากเล่น — แบ่งเท่ากัน ตัวเศษ ตัวส่วน อ่านภาพ ครบพื้นฐานเศษส่วน!"
    />
  );
}
