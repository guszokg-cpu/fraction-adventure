"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Plus, Eye, EyeOff, Trash2, ImagePlus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  fetchStore,
  addBlock,
  toggleBlockVisibilityApi,
  deleteBlockApi,
  toggleStepHiddenApi,
  type ExtraContentBlock,
} from "@/lib/extraContentApi";

const LESSONS = [
  { slug: "fraction-intro",       title: "รู้จักเศษส่วน" },
  { slug: "read-write",           title: "อ่านและเขียนเศษส่วน" },
  { slug: "fraction-from-image",  title: "เศษส่วนจากภาพ" },
  { slug: "number-line",          title: "เศษส่วนบนเส้นจำนวน" },
  { slug: "compare",              title: "เปรียบเทียบเศษส่วน" },
  { slug: "equivalent",           title: "เศษส่วนที่เท่ากัน" },
  { slug: "simplify-expand",      title: "เศษส่วนอย่างต่ำ" },
  { slug: "mixed-improper",       title: "จำนวนคละและเศษเกิน" },
  { slug: "add",                  title: "บวกเศษส่วน" },
  { slug: "subtract",             title: "ลบเศษส่วน" },
  { slug: "multiply",             title: "คูณเศษส่วน" },
  { slug: "divide",               title: "หารเศษส่วน" },
];

type Props = { onClose: () => void };

export function AdminContentManager({ onClose }: Props) {
  const [selectedLesson, setSelectedLesson] = useState(LESSONS[0].slug);
  const [selectedStep, setSelectedStep] = useState(1);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [previewOk, setPreviewOk] = useState<boolean | null>(null);
  const [blocks, setBlocks] = useState<ExtraContentBlock[]>([]);
  const [builtInHidden, setBuiltInHidden] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const store = await fetchStore();
    setBlocks(store.blocks);
    setBuiltInHidden((store.hiddenSteps[selectedLesson] ?? []).includes(selectedStep));
    setLoading(false);
  }, [selectedLesson, selectedStep]);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  async function handleAdd() {
    if (!imageUrl.trim() || previewOk === false) return;
    setSaving(true);
    await addBlock({
      lessonSlug: selectedLesson,
      stepIndex: selectedStep,
      imageUrl: imageUrl.trim(),
      caption: caption.trim(),
      visible: true,
    });
    setImageUrl("");
    setCaption("");
    setPreviewOk(null);
    await reload();
    setSaving(false);
  }

  async function handleToggle(id: string) {
    setSaving(true);
    await toggleBlockVisibilityApi(id);
    await reload();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setSaving(true);
    await deleteBlockApi(id);
    await reload();
    setSaving(false);
  }

  async function handleToggleBuiltIn() {
    setSaving(true);
    await toggleStepHiddenApi(selectedLesson, selectedStep);
    setBuiltInHidden((v) => !v);
    setSaving(false);
  }

  const stepBlocks = blocks
    .filter((b) => b.lessonSlug === selectedLesson && b.stepIndex === selectedStep)
    .sort((a, b) => a.createdAt - b.createdAt);

  const allLessonBlocks = blocks.filter((b) => b.lessonSlug === selectedLesson);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4">
          <div className="flex items-center gap-2">
            <ImagePlus size={20} className="text-white/90" />
            <h2 className="text-lg font-extrabold text-white">จัดการเนื้อหาบทเรียน</h2>
            {saving && <Loader2 size={16} className="animate-spin text-white/70" />}
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">

          {/* Lesson + Step selector */}
          <div className="shrink-0 space-y-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-500">บทเรียน</label>
              <select
                value={selectedLesson}
                onChange={(e) => { setSelectedLesson(e.target.value); setSelectedStep(1); }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                {LESSONS.map((l) => (
                  <option key={l.slug} value={l.slug}>{l.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-500">
                ขั้นที่ (Step) — มีเนื้อหา {allLessonBlocks.length} บล็อกในบทเรียนนี้
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedStep((s) => Math.max(1, s - 1))}
                  disabled={selectedStep <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-violet-300 hover:text-violet-600 disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex-1 rounded-xl border border-violet-200 bg-violet-50 py-2 text-center text-sm font-extrabold text-violet-700">
                  ขั้นที่ {selectedStep}
                  <span className="ml-1.5 font-normal text-violet-400">
                    ({stepBlocks.length} บล็อก)
                  </span>
                </div>
                <button
                  onClick={() => setSelectedStep((s) => s + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-violet-300 hover:text-violet-600"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Built-in content toggle */}
          <div className="shrink-0 border-b border-slate-100 px-5 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-600">เนื้อหาหลัก (โค้ด)</p>
                <p className="text-[11px] text-slate-400">เนื้อหาที่เขียนไว้ในโค้ดของขั้นนี้</p>
              </div>
              <button
                onClick={handleToggleBuiltIn}
                disabled={saving}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold transition disabled:opacity-50",
                  builtInHidden
                    ? "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 hover:bg-emerald-100"
                )}
              >
                {builtInHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                {builtInHidden ? "ซ่อนอยู่" : "แสดงอยู่"}
              </button>
            </div>
          </div>

          {/* Add form */}
          <div className="shrink-0 border-b border-slate-100 px-5 py-4">
            <p className="mb-3 text-xs font-extrabold text-slate-500">เพิ่มภาพใหม่</p>
            <div className="space-y-2.5">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => { setImageUrl(e.target.value); setPreviewOk(null); }}
                placeholder="วาง URL ภาพ (imgbb / Google Drive / Canva)"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
              {imageUrl && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <img
                    src={imageUrl}
                    alt="preview"
                    className="max-h-32 w-full object-contain"
                    onLoad={() => setPreviewOk(true)}
                    onError={() => setPreviewOk(false)}
                  />
                  {previewOk === false && (
                    <p className="px-3 py-1.5 text-xs font-bold text-rose-500">❌ โหลดภาพไม่ได้ ลอง URL อื่น</p>
                  )}
                </div>
              )}
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="คำบรรยายภาพ (ไม่บังคับ)"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <button
                onClick={handleAdd}
                disabled={!imageUrl.trim() || previewOk === false || saving}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-extrabold transition",
                  imageUrl.trim() && previewOk !== false && !saving
                    ? "bg-violet-600 text-white hover:bg-violet-700 active:scale-[0.98]"
                    : "bg-slate-100 text-slate-400"
                )}
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={16} />}
                เพิ่มภาพในขั้นที่ {selectedStep}
              </button>
            </div>
          </div>

          {/* Block list */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 size={28} className="animate-spin text-violet-400" />
              </div>
            ) : stepBlocks.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-400">
                <ImagePlus size={36} className="opacity-30" />
                <p className="font-bold">ยังไม่มีเนื้อหาเพิ่มเติม</p>
                <p className="text-xs">วาง URL ภาพด้านบนแล้วกด เพิ่มภาพ</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stepBlocks.map((block) => (
                  <div
                    key={block.id}
                    className={cn(
                      "flex gap-3 overflow-hidden rounded-xl border p-2.5 transition",
                      block.visible ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"
                    )}
                  >
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      <img src={block.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-700">
                        {block.caption || "(ไม่มีคำบรรยาย)"}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-slate-400">{block.imageUrl}</p>
                      <span className={cn(
                        "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold",
                        block.visible ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                      )}>
                        {block.visible ? "แสดงอยู่" : "ซ่อนอยู่"}
                      </span>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1.5">
                      <button
                        onClick={() => handleToggle(block.id)}
                        disabled={saving}
                        title={block.visible ? "ซ่อนภาพ" : "แสดงภาพ"}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-violet-300 hover:text-violet-600 disabled:opacity-40"
                      >
                        {block.visible ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => handleDelete(block.id)}
                        disabled={saving}
                        title="ลบภาพนี้"
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
    </div>
  );
}
