"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Plus, Eye, EyeOff, Trash2, FileText, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  fetchWorksheetsConfig,
  addWorksheet,
  deleteWorksheet,
  toggleWorksheetVisible,
  type WsItem,
} from "@/lib/worksheetsConfigApi";
import type { WorksheetLevel, WorksheetFileType } from "@/types/worksheet";

const LESSONS = [
  { slug: "fraction-intro",      title: "รู้จักเศษส่วน" },
  { slug: "read-write",          title: "อ่านและเขียนเศษส่วน" },
  { slug: "fraction-from-image", title: "เศษส่วนจากภาพ" },
  { slug: "number-line",         title: "เศษส่วนบนเส้นจำนวน" },
  { slug: "compare",             title: "เปรียบเทียบเศษส่วน" },
  { slug: "equivalent",          title: "เศษส่วนที่เท่ากัน" },
  { slug: "simplify-expand",     title: "ย่อและขยายเศษส่วน" },
  { slug: "mixed-improper",      title: "จำนวนคละและเศษเกิน" },
  { slug: "add",                 title: "บวกเศษส่วน" },
  { slug: "subtract",            title: "ลบเศษส่วน" },
  { slug: "multiply",            title: "คูณเศษส่วน" },
  { slug: "divide",              title: "หารเศษส่วน" },
];

const LEVELS: WorksheetLevel[] = ["พื้นฐาน", "ฝึกทักษะ", "ท้าทาย"];
const FILE_TYPES: WorksheetFileType[] = ["PDF", "Word", "PNG", "Link"];

const LEVEL_STYLES: Record<string, string> = {
  พื้นฐาน: "bg-sky-50 text-sky-700",
  ฝึกทักษะ: "bg-amber-50 text-amber-700",
  ท้าทาย: "bg-rose-50 text-rose-700",
};

type Props = { onClose: () => void };

const EMPTY_FORM = {
  title: "",
  description: "",
  level: "พื้นฐาน" as WorksheetLevel,
  fileType: "PDF" as WorksheetFileType,
  fileUrl: "",
  previewImage: "",
};

export function AdminWorksheetsManager({ onClose }: Props) {
  const [selectedLesson, setSelectedLesson] = useState(LESSONS[0].slug);
  const [items, setItems] = useState<WsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [previewOk, setPreviewOk] = useState<boolean | null>(null);

  const reload = useCallback(async () => {
    const config = await fetchWorksheetsConfig();
    const all = (config[selectedLesson] ?? []).sort((a, b) => a.sortOrder - b.sortOrder);
    setItems(all);
    setLoading(false);
  }, [selectedLesson]);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  async function handleAdd() {
    if (!form.title.trim()) return;
    setSaving(true);
    await addWorksheet(selectedLesson, {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      fileUrl: form.fileUrl.trim(),
      previewImage: form.previewImage.trim(),
      visible: true,
    });
    setForm(EMPTY_FORM);
    setPreviewOk(null);
    setShowForm(false);
    await reload();
    setSaving(false);
  }

  async function handleToggle(id: string) {
    setSaving(true);
    await toggleWorksheetVisible(selectedLesson, id);
    await reload();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setSaving(true);
    await deleteWorksheet(selectedLesson, id);
    await reload();
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-gradient-to-r from-pink-600 to-rose-500 px-5 py-4">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-white/90" />
            <h2 className="text-lg font-extrabold text-white">จัดการใบงาน</h2>
            {saving && <Loader2 size={16} className="animate-spin text-white/70" />}
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Lesson selector */}
        <div className="shrink-0 border-b border-slate-100 bg-slate-50 px-5 py-3">
          <label className="mb-1 block text-xs font-extrabold text-slate-500">เลือกบทเรียน</label>
          <select
            value={selectedLesson}
            onChange={(e) => setSelectedLesson(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          >
            {LESSONS.map((l) => (
              <option key={l.slug} value={l.slug}>{l.title}</option>
            ))}
          </select>
        </div>

        {/* Add form toggle */}
        <div className="shrink-0 border-b border-slate-100 px-5 py-3">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-pink-200 py-2.5 text-sm font-extrabold text-pink-500 transition hover:border-pink-400 hover:bg-pink-50"
          >
            <Plus size={16} />
            {showForm ? "ยกเลิกการเพิ่ม" : "เพิ่มใบงานใหม่"}
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="shrink-0 space-y-2.5 border-b border-slate-100 bg-pink-50/40 px-5 py-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className="mb-1 block text-[11px] font-extrabold text-slate-500">ชื่อใบงาน *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="เช่น ใบงานเรื่องเศษส่วนเบื้องต้น"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-extrabold text-slate-500">ระดับ</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as WorksheetLevel }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pink-400"
                >
                  {LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-extrabold text-slate-500">ประเภทไฟล์</label>
                <select
                  value={form.fileType}
                  onChange={(e) => setForm((f) => ({ ...f, fileType: e.target.value as WorksheetFileType }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pink-400"
                >
                  {FILE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-[11px] font-extrabold text-slate-500">ลิงก์ดาวน์โหลด (Google Drive / PDF URL)</label>
                <input
                  type="url"
                  value={form.fileUrl}
                  onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-[11px] font-extrabold text-slate-500">ภาพปก (URL — ไม่บังคับ)</label>
                <input
                  type="url"
                  value={form.previewImage}
                  onChange={(e) => { setForm((f) => ({ ...f, previewImage: e.target.value })); setPreviewOk(null); }}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />
                {form.previewImage && (
                  <div className="mt-1.5 h-14 w-10 overflow-hidden rounded border border-slate-200">
                    <img
                      src={form.previewImage}
                      alt=""
                      className="h-full w-full object-cover"
                      onLoad={() => setPreviewOk(true)}
                      onError={() => setPreviewOk(false)}
                    />
                  </div>
                )}
                {previewOk === false && (
                  <p className="mt-0.5 text-xs font-bold text-rose-500">❌ โหลดภาพไม่ได้</p>
                )}
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-[11px] font-extrabold text-slate-500">คำอธิบาย (ไม่บังคับ)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="อธิบายสั้น ๆ เกี่ยวกับใบงานนี้"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!form.title.trim() || saving}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-extrabold transition",
                form.title.trim() && !saving
                  ? "bg-pink-600 text-white hover:bg-pink-700"
                  : "bg-slate-100 text-slate-400"
              )}
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              บันทึกใบงาน
            </button>
          </div>
        )}

        {/* Worksheet list */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 size={28} className="animate-spin text-pink-400" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-400">
              <FileText size={36} className="opacity-30" />
              <p className="font-bold">ยังไม่มีใบงาน</p>
              <p className="text-xs">กด &quot;เพิ่มใบงานใหม่&quot; ด้านบน</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {items.map((ws) => (
                <div
                  key={ws.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 transition",
                    ws.visible ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"
                  )}
                >
                  {ws.previewImage ? (
                    <div className="h-10 w-7 shrink-0 overflow-hidden rounded border border-slate-200">
                      <img src={ws.previewImage} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-lg">📄</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-700">{ws.title}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", LEVEL_STYLES[ws.level])}>
                        {ws.level}
                      </span>
                      <span className="text-[10px] text-slate-400">{ws.fileType}</span>
                      <span className={cn(
                        "ml-1 text-[10px] font-bold",
                        ws.visible ? "text-emerald-500" : "text-slate-400"
                      )}>
                        {ws.visible ? "แสดงอยู่" : "ซ่อนอยู่"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      onClick={() => handleToggle(ws.id)}
                      disabled={saving}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-pink-300 hover:text-pink-600 disabled:opacity-40"
                    >
                      {ws.visible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(ws.id)}
                      disabled={saving}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-rose-300 hover:text-rose-500 disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
