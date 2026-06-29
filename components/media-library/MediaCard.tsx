"use client";

import { useState } from "react";
import { Star, ExternalLink, Copy, Check, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { TYPE_META, type MediaItem } from "@/components/media-library/data";

type Props = {
  item: MediaItem;
  onToggleFavorite: (id: string) => void;
  onEdit: (item: MediaItem) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
};

export function MediaCard({ item, onToggleFavorite, onEdit, onDelete, isAdmin }: Props) {
  const meta = TYPE_META[item.type];
  const [copied, setCopied] = useState(false);

  function openLink() {
    if (item.mediaUrl) window.open(item.mediaUrl, "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(item.mediaUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* คลิปบอร์ดอาจถูกบล็อกในบาง environment */
    }
  }

  return (
    <Card className="flex flex-col overflow-hidden p-0">
      {/* ภาพปก */}
      <div className="relative h-36 w-full overflow-hidden">
        {item.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.coverImage} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br text-6xl", meta.cover)}>
            {meta.emoji}
          </div>
        )}
        <span className={cn("absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-extrabold", meta.badge)}>
          {meta.label}
        </span>
        <button
          onClick={() => onToggleFavorite(item.id)}
          aria-label={item.favorite ? "เอาออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-slate-400 shadow-sm transition hover:text-amber-500"
        >
          <Star size={16} className={cn(item.favorite && "fill-amber-400 text-amber-400")} />
        </button>
      </div>

      {/* เนื้อหา */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-extrabold text-brand-900">{item.title}</h3>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-extrabold text-brand-700">
            {item.grade}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
            ✦ {item.category}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-500">{item.description}</p>

        {/* ปุ่มจัดการ */}
        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
          <button
            onClick={openLink}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-extrabold text-brand-700 transition hover:bg-brand-100"
          >
            <ExternalLink size={13} /> เปิดลิงก์
          </button>
          <button
            onClick={copyLink}
            aria-label="คัดลอกลิงก์"
            className={cn(
              "grid h-8 w-8 place-items-center rounded-lg border transition",
              copied
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-slate-200 text-slate-500 hover:bg-slate-50",
            )}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => onEdit(item)}
                aria-label="แก้ไข"
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                aria-label="ลบ"
                className="grid h-8 w-8 place-items-center rounded-lg border border-rose-200 text-rose-500 transition hover:bg-rose-50"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
