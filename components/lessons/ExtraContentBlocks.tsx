"use client";

import { useState, useEffect } from "react";
import { getVisibleBlocksForStep, type ExtraContentBlock } from "@/lib/extraContent";

type Props = {
  lessonSlug: string;
  stepIndex: number;
};

export function ExtraContentBlocks({ lessonSlug, stepIndex }: Props) {
  const [blocks, setBlocks] = useState<ExtraContentBlock[]>([]);

  useEffect(() => {
    const load = () => setBlocks(getVisibleBlocksForStep(lessonSlug, stepIndex));
    load();
    const id = setInterval(load, 1500);
    return () => clearInterval(id);
  }, [lessonSlug, stepIndex]);

  if (blocks.length === 0) return null;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-violet-100" />
        <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-0.5 text-[11px] font-bold text-violet-500">
          เนื้อหาเพิ่มเติม
        </span>
        <div className="h-px flex-1 bg-violet-100" />
      </div>
      {blocks.map((block) => (
        <div key={block.id} className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <img
            src={block.imageUrl}
            alt={block.caption || "เนื้อหาเพิ่มเติม"}
            className="w-full object-contain"
            loading="lazy"
          />
          {block.caption && (
            <p className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
              {block.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
