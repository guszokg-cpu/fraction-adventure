"use client";

import { useState } from "react";
import { Eraser, PaintBucket, Shuffle, RotateCcw, Bookmark, Check } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  onClear: () => void;
  onFillOne: () => void;
  onRandomize: () => void;
  onReset: () => void;
};

export function FractionActionButtons({ onClear, onFillOne, onRandomize, onReset }: Props) {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      <button
        onClick={onClear}
        className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
      >
        <Eraser size={16} />
        ล้างสีทั้งหมด
      </button>
      <button
        onClick={onFillOne}
        className="flex items-center gap-1.5 rounded-xl border-2 border-sky-200 bg-white px-4 py-2.5 text-sm font-extrabold text-sky-600 transition hover:bg-sky-50"
      >
        <PaintBucket size={16} />
        ระบายเต็ม 1 รูป
      </button>
      <button
        onClick={onRandomize}
        className="flex items-center gap-1.5 rounded-xl border-2 border-violet-200 bg-white px-4 py-2.5 text-sm font-extrabold text-violet-600 transition hover:bg-violet-50"
      >
        <Shuffle size={16} />
        สุ่มตัวอย่าง
      </button>
      <button
        onClick={onReset}
        className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
      >
        <RotateCcw size={16} />
        เริ่มใหม่
      </button>
      <button
        onClick={handleSave}
        className={cn(
          "flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white transition",
          saved ? "bg-emerald-500" : "bg-brand-600 hover:bg-brand-700"
        )}
      >
        {saved ? <Check size={16} /> : <Bookmark size={16} />}
        {saved ? "บันทึกแล้ว!" : "บันทึกคำตอบ"}
      </button>
    </div>
  );
}
