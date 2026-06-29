"use client";

import { MediaCard } from "@/components/media-library/MediaCard";
import type { MediaItem } from "@/components/media-library/data";

type Props = {
  items: MediaItem[];
  onToggleFavorite: (id: string) => void;
  onEdit: (item: MediaItem) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
};

export function MediaGrid({ items, onToggleFavorite, onEdit, onDelete, isAdmin }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-200 bg-white/60 py-16 text-center">
        <div className="text-5xl">🔍</div>
        <p className="mt-3 text-lg font-extrabold text-brand-900">ไม่พบสื่อที่ตรงกับเงื่อนไข</p>
        <p className="mt-1 text-sm font-bold text-slate-500">ลองเปลี่ยนคำค้นหรือตัวกรอง แล้วลองใหม่อีกครั้ง</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <MediaCard
          key={item.id}
          item={item}
          onToggleFavorite={onToggleFavorite}
          onEdit={onEdit}
          onDelete={onDelete}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}
