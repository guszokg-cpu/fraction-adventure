"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Save, Loader2, Video, Check } from "lucide-react";
import { fetchVideosConfig, setVideoUrl } from "@/lib/videosConfigApi";
import { toEmbedUrl } from "@/data/lessonVideos";

const LESSONS = [
  { path: "/lessons/fraction-intro",      title: "รู้จักเศษส่วน" },
  { path: "/lessons/read-write",          title: "อ่านและเขียนเศษส่วน" },
  { path: "/lessons/fraction-from-image", title: "เศษส่วนจากภาพ" },
  { path: "/lessons/number-line",         title: "เศษส่วนบนเส้นจำนวน" },
  { path: "/lessons/compare",             title: "เปรียบเทียบเศษส่วน" },
  { path: "/lessons/equivalent",          title: "เศษส่วนที่เท่ากัน" },
  { path: "/lessons/simplify-expand",     title: "เศษส่วนอย่างต่ำ" },
  { path: "/lessons/mixed-improper",      title: "จำนวนคละและเศษเกิน" },
  { path: "/lessons/add",                 title: "บวกเศษส่วน" },
  { path: "/lessons/subtract",            title: "ลบเศษส่วน" },
  { path: "/lessons/multiply",            title: "คูณเศษส่วน" },
  { path: "/lessons/divide",              title: "หารเศษส่วน" },
];

type Props = { onClose: () => void };

export function AdminVideosManager({ onClose }: Props) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const config = await fetchVideosConfig();
    setUrls(config);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(lessonPath: string) {
    setSaving(lessonPath);
    await setVideoUrl(lessonPath, urls[lessonPath] ?? "");
    setSaving(null);
    setSaved(lessonPath);
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-gradient-to-r from-red-600 to-rose-500 px-5 py-4">
          <div className="flex items-center gap-2">
            <Video size={20} className="text-white/90" />
            <h2 className="text-lg font-extrabold text-white">จัดการวิดีโอบทเรียน</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <p className="shrink-0 border-b border-slate-100 bg-rose-50 px-5 py-2.5 text-xs font-medium text-rose-700">
          วาง YouTube URL ทุกรูปแบบได้เลย — ระบบจะแปลงเป็น embed ให้อัตโนมัติ
        </p>

        {/* List */}
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 size={28} className="animate-spin text-rose-400" />
            </div>
          ) : (
            LESSONS.map((lesson) => {
              const url = urls[lesson.path] ?? "";
              const isSaving = saving === lesson.path;
              const isSaved = saved === lesson.path;
              const embedUrl = toEmbedUrl(url);

              return (
                <div key={lesson.path} className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-2.5 flex items-center gap-2">
                    <span className="text-base">▶️</span>
                    <span className="text-sm font-extrabold text-slate-700">{lesson.title}</span>
                    {url ? (
                      <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 ring-1 ring-emerald-200">
                        มีวิดีโอ
                      </span>
                    ) : (
                      <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                        ยังไม่มี
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrls((prev) => ({ ...prev, [lesson.path]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && handleSave(lesson.path)}
                      placeholder="https://youtu.be/XXXXX หรือ https://www.youtube.com/watch?v=XXXXX"
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    />
                    <button
                      onClick={() => handleSave(lesson.path)}
                      disabled={!!isSaving}
                      className="flex shrink-0 items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                      {isSaving ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : isSaved ? (
                        <Check size={13} />
                      ) : (
                        <Save size={13} />
                      )}
                      {isSaved ? "บันทึกแล้ว!" : "บันทึก"}
                    </button>
                  </div>

                  {embedUrl && (
                    <div className="relative mt-3 w-full overflow-hidden rounded-lg" style={{ paddingBottom: "28%" }}>
                      <iframe
                        src={embedUrl}
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
