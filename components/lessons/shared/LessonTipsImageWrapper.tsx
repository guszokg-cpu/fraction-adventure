"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/Card";

const TIPS_IMAGES_KEY = "fa_lesson_tips_images";

type Props = {
  lessonSlug: string;
  children: ReactNode;
};

export function LessonTipsImageWrapper({ lessonSlug, children }: Props) {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TIPS_IMAGES_KEY);
      if (raw) {
        const map = JSON.parse(raw) as Record<string, string>;
        setImage(map[lessonSlug] ?? null);
      }
    } catch {}
  }, [lessonSlug]);

  if (!image) return <>{children}</>;

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-brand-900">จำง่าย ๆ</h2>
        <Lightbulb className="text-accent-500" size={22} />
      </div>
      <img
        src={image}
        alt="ภาพสรุปบทเรียน"
        className="w-full rounded-xl border border-slate-100"
      />
    </Card>
  );
}
