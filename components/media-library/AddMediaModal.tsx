"use client";

import { useEffect, useRef, useState } from "react";
import { X, ImagePlus, ExternalLink, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  CATEGORY_OPTIONS,
  GRADE_OPTIONS,
  TYPE_META,
  type MediaItem,
  type MediaType,
} from "@/components/media-library/data";

type Props = {
  open: boolean;
  initial: MediaItem | null;
  onClose: () => void;
  onSave: (item: MediaItem) => void;
};

type FormState = {
  title: string;
  description: string;
  type: MediaType;
  grade: string;
  category: string;
  coverImage: string;
  mediaUrl: string;
  tags: string;
};

const EMPTY: FormState = {
  title: "",
  description: "",
  type: "worksheet",
  grade: "ป.4",
  category: "รู้จักเศษส่วน",
  coverImage: "",
  mediaUrl: "",
  tags: "",
};

const TYPE_VALUES = Object.keys(TYPE_META) as MediaType[];

const fieldClass =
  "h-11 w-full rounded-lg border border-brand-100 bg-white px-3 text-sm font-bold text-brand-700 outline-none transition focus:border-brand-400";
const labelClass = "mb-1 block text-sm font-extrabold text-slate-600";

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function AddMediaModal({ open, initial, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        title: initial.title,
        description: initial.description,
        type: initial.type,
        grade: initial.grade,
        category: initial.category,
        coverImage: initial.coverImage ?? "",
        mediaUrl: initial.mediaUrl,
        tags: initial.tags.join(", "),
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, initial]);

  if (!open) return null;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleFile(file?: File) {
    if (!file) return;
    // preview ทันทีด้วย object URL
    const previewUrl = URL.createObjectURL(file);
    set("coverImage", previewUrl);
    // อ่านเป็น data URL เพื่อให้บันทึกแล้วคงอยู่หลังรีโหลด
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") set("coverImage", reader.result);
      URL.revokeObjectURL(previewUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!form.title.trim()) return;
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const item: MediaItem = {
      id: initial?.id ?? newId(),
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      grade: form.grade,
      category: form.category,
      coverImage: form.coverImage || undefined,
      mediaUrl: form.mediaUrl.trim(),
      tags,
      favorite: initial?.favorite ?? false,
      uses: initial?.uses ?? 0,
      createdAt: initial?.createdAt ?? Date.now(),
    };
    onSave(item);
  }

  const meta = TYPE_META[form.type];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center" role="dialog" aria-modal="true">
      <button aria-label="ปิด" onClick={onClose} className="absolute inset-0 bg-slate-900/50" />

      <div className="fa-rise relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* หัว modal */}
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-brand-700 to-violet-600 px-5 py-4 text-white">
          <h2 className="text-lg font-extrabold">{initial ? "แก้ไขสื่อการสอน" : "เพิ่มสื่อใหม่"}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white/20 transition hover:bg-white/30">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          <div>
            <label className={labelClass}>ชื่อสื่อ *</label>
            <input
              className={fieldClass}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="เช่น ใบงานรู้จักเศษส่วน"
            />
          </div>

          <div>
            <label className={labelClass}>คำอธิบาย</label>
            <textarea
              className="min-h-[72px] w-full rounded-lg border border-brand-100 bg-white px-3 py-2 text-sm font-bold text-brand-700 outline-none transition focus:border-brand-400"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="อธิบายสั้น ๆ เกี่ยวกับสื่อนี้"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>ประเภทสื่อ</label>
              <select className={fieldClass} value={form.type} onChange={(e) => set("type", e.target.value as MediaType)}>
                {TYPE_VALUES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_META[t].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>ระดับชั้น</label>
              <select className={fieldClass} value={form.grade} onChange={(e) => set("grade", e.target.value)}>
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>หมวดบทเรียน</label>
              <select className={fieldClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* อัปโหลดภาพปก + preview */}
          <div>
            <label className={labelClass}>ภาพปก</label>
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-brand-100 bg-slate-50">
                {form.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.coverImage} alt="ภาพปกตัวอย่าง" className="h-full w-full object-cover" />
                ) : (
                  <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br text-4xl", meta.cover)}>
                    {meta.emoji}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-brand-100 bg-white px-3 py-2 text-sm font-extrabold text-brand-700 transition hover:bg-brand-50"
                >
                  <ImagePlus size={16} /> อัปโหลดภาพปก
                </button>
                {form.coverImage && (
                  <button
                    onClick={() => set("coverImage", "")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:underline"
                  >
                    <Trash2 size={13} /> ลบภาพปก
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ลิงก์สื่อ */}
          <div>
            <label className={labelClass}>ลิงก์สื่อการสอน</label>
            <div className="flex gap-2">
              <input
                className={fieldClass}
                value={form.mediaUrl}
                onChange={(e) => set("mediaUrl", e.target.value)}
                placeholder="https://..."
              />
              <button
                onClick={() => form.mediaUrl && window.open(form.mediaUrl, "_blank", "noopener,noreferrer")}
                disabled={!form.mediaUrl}
                className="inline-flex h-11 shrink-0 items-center gap-1 rounded-lg border border-brand-100 bg-white px-3 text-sm font-extrabold text-brand-700 transition hover:bg-brand-50 disabled:opacity-50"
              >
                <ExternalLink size={15} /> เปิด
              </button>
            </div>
          </div>

          {/* แท็ก */}
          <div>
            <label className={labelClass}>แท็กคำค้น (คั่นด้วยคอมมา)</label>
            <input
              className={fieldClass}
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="เช่น ใบงาน, เริ่มต้น, เฉลย"
            />
          </div>
        </div>

        {/* ปุ่ม */}
        <div className="flex items-center justify-end gap-3 rounded-b-2xl border-t border-slate-100 px-5 py-4">
          <button
            onClick={onClose}
            className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={!form.title.trim()}
            className="h-11 rounded-lg bg-violet-600 px-6 text-sm font-extrabold text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
