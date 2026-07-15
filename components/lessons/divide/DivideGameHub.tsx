"use client";

import { LessonGameHub } from "@/components/games/LessonGameHub";

export function DivideGameHub() {
  return (
    <LessonGameHub
      slug="divide"
      stepNo={9}
      title="โซนเกมการหารเศษส่วน 🎮"
      headerGradient="bg-gradient-to-r from-violet-600 to-purple-500"
      theme="violet"
      intro="เลือกเกมที่อยากเล่น — ฝึกหารเศษส่วนจากสถานการณ์จริง ทั้ง “มีกี่ชิ้น” และ “แบ่งเท่า ๆ กัน”!"
    />
  );
}
