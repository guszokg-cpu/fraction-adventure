"use client";

import { useState, useEffect, useRef } from "react";
import { X, Link as LinkIcon, Upload, Trash2 } from "lucide-react";
import type { Worksheet, WorksheetLevel, WorksheetFileType } from "@/types/worksheet";

const LESSON_OPTIONS = [
  { slug: "fraction-intro",   label: "บทที่ 1 – รู้จักเศษส่วน" },
  { slug: "read-write",       label: "บทที่ 2 – อ่านและเขียนเศษส่วน" },
  { slug: "fraction-from-image", label: "บทที่ 3 – เศษส่วนจากภาพ" },
  { slug: "number-line",      label: "บทที่ 4 – เศษส่วนบนเส้นจำนวน" },
  { slug: "compare",          label: "บทที่ 5 – เปรียบเทียบเศษส่วน" },
  { slug: "equivalent",       label: "บทที่ 6 – เศษส่วนเท่ากัน" },
  { slug: "simplify-expand",  label: "บทที่ 7 – ทำให้เป็นอย่างต่ำ" },
  { slug: "mixed-improper",   label: "บทที่ 8 – เศษเกินและจำนวนคละ" },
  { slug: "add",              label: "บทที่ 9 – บวกเศษส่วน" },
  { slug: "subtract",         label: "บทที่ 10 – ลบเศษส่วน" },
  { slug: "multiply",         label: "บทที่ 11 – คูณเศษส่วน" },
  { slug: "divide",           label: "บทที่ 12 – หารเศษส่วน" },
];

const LEVELS: WorksheetLevel[] = ["พื้นฐาน", "ฝึกทักษะ", "ท้าทาย"];
const FILE_TYPES: WorksheetFileType[] = ["PDF", "Word", "PNG", "Link"];

type FormData = Omit<Worksheet, "id" | "createdAt" | "updatedAt">;

const EMPTY_FORM: FormData = {
  lessonSlug: "fraction-intro",
  title: "",
  description: "",
  level: "พื้นฐาน",
  fileType: "PDF",
  fileUrl: "",
  previewImage: undefined,
  sortOrder: 1,
  isPublished: true,
};

// Resize image to max 320px wide JPEG via canvas (keeps localStorage small)
function resizeToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX_W = 320;
        const ratio = img.height / img.width;
        const w = Math.min(img.width, MAX_W);
        const h = Math.round(w * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

type Props = {
  initial?: Worksheet | null;
  onSave: (data: FormData) => void;
  onClose: () => void;
};

export function WorksheetForm({ initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initial) {
      const { id, createdAt, updatedAt, ...rest } = initial;
      void id; void createdAt; void updatedAt;
      setForm(rest);
    } else {
      setForm(EMPTY_FORM);
    }
  }, [initial]);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const b64 = await resizeToBase64(file);
      set("previewImage", b64);
    } finally {
      setUploading(false);
      if (imgInputRef.current) imgInputRef.current.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!form.fileUrl.trim()) return;
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-extrabold text-slate-800">
            {initial ? "แก้ไขใบงาน" : "เพิ่มใบงานใหม่"}
          </h2>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-6" style={{ maxHeight: "75vh" }}>

          {/* Lesson */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">บทเรียน *</label>
            <select
              value={form.lessonSlug}
              onChange={(e) => set("lessonSlug", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              {LESSON_OPTIONS.map((l) => (
                <option key={l.slug} value={l.slug}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">ชื่อใบงาน *</label>
            <input
              required
              type="text"
              placeholder="เช่น รู้จักเศษส่วนเบื้องต้น"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">คำอธิบาย</label>
            <textarea
              rows={2}
              placeholder="อธิบายสั้น ๆ ว่าใบงานนี้ฝึกอะไร"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {/* Level + File type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">ระดับ</label>
              <select
                value={form.level}
                onChange={(e) => set("level", e.target.value as WorksheetLevel)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">ประเภทไฟล์</label>
              <select
                value={form.fileType}
                onChange={(e) => set("fileType", e.target.value as WorksheetFileType)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                {FILE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Google Drive URL */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">ลิงก์ Google Drive *</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
              <LinkIcon size={14} className="shrink-0 text-slate-400" />
              <input
                type="url"
                required
                placeholder="https://drive.google.com/file/d/..."
                value={form.fileUrl}
                onChange={(e) => set("fileUrl", e.target.value)}
                className="flex-1 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-300"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">วางลิงก์ Google Drive หรือ URL ใบงานโดยตรง</p>
          </div>

          {/* Preview image */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">ภาพตัวอย่างใบงาน (A4)</label>
            <input
              ref={imgInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            {form.previewImage ? (
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {/* A4 ratio preview */}
                <div className="relative w-full" style={{ paddingBottom: "141.4%" }}>
                  <img
                    src={form.previewImage}
                    alt="ตัวอย่างใบงาน"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-2 border-t border-slate-200 bg-white px-3 py-2">
                  <span className="flex-1 text-[11px] font-bold text-emerald-600">✅ มีภาพตัวอย่างแล้ว</span>
                  <button
                    type="button"
                    onClick={() => imgInputRef.current?.click()}
                    className="flex items-center gap-1 rounded-lg bg-violet-50 px-2.5 py-1.5 text-[11px] font-extrabold text-violet-600 hover:bg-violet-100"
                  >
                    <Upload size={11} /> เปลี่ยนรูป
                  </button>
                  <button
                    type="button"
                    onClick={() => set("previewImage", undefined)}
                    className="flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] font-extrabold text-rose-500 hover:bg-rose-100"
                  >
                    <Trash2 size={11} /> ลบ
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploading}
                onClick={() => imgInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-5 text-sm font-extrabold text-slate-400 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-500 disabled:opacity-50"
              >
                <Upload size={16} />
                {uploading ? "กำลังประมวลผล..." : "อัปโหลดภาพตัวอย่าง (PNG / JPG)"}
              </button>
            )}
            <p className="mt-1 text-[11px] text-slate-400">
              ถ่ายรูปหรือสแกนหน้าแรกของใบงาน — ระบบจะย่อรูปอัตโนมัติ
            </p>
          </div>

          {/* Sort order + Published */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-bold text-slate-600">ลำดับที่แสดง</label>
              <input
                type="number"
                min={1}
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <div className="mb-0.5 flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5">
              <input
                id="published"
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => set("isPublished", e.target.checked)}
                className="h-4 w-4 rounded accent-violet-600"
              />
              <label htmlFor="published" className="text-sm font-bold text-slate-700 cursor-pointer">เผยแพร่</label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
            >
              {initial ? "บันทึกการแก้ไข" : "เพิ่มใบงาน"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
