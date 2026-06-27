"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  lessonId: string;
  icon: string;
  locked: boolean;
  color: string;
};

export function LessonCardImage({ lessonId, icon, locked, color }: Props) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    // Fallback: colored bg + large emoji, fixed height to keep grid consistent
    return (
      <div className={cn("flex h-36 w-full items-center justify-center text-6xl", color)}>
        {icon}
      </div>
    );
  }

  return (
    <img
      src={`/images/lessons/${lessonId}.png`}
      alt=""
      // w-full h-auto → shows the FULL image at its natural aspect ratio, no cropping
      className={cn("block w-full h-auto", locked && "grayscale opacity-55")}
      onError={() => setHasError(true)}
    />
  );
}
