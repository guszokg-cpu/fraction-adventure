"use client";

import { useEffect, useState } from "react";
import { FileText, Download, ExternalLink, BookOpen } from "lucide-react";
import { fetchWorksheetsConfig, type WsItem } from "@/lib/worksheetsConfigApi";

type Props = { lessonSlug: string };

const LEVEL_STYLES: Record<string, string> = {
  พื้นฐาน: "bg-sky-50 text-sky-700 border-sky-200",
  ฝึกทักษะ: "bg-amber-50 text-amber-700 border-amber-200",
  ท้าทาย: "bg-rose-50 text-rose-700 border-rose-200",
};

const FILE_ICONS: Record<string, string> = {
  PDF: "📄",
  Word: "📝",
  PNG: "🖼️",
  Link: "🔗",
};

function WorksheetCard({ ws, isLast }: { ws: WsItem; isLast: boolean }) {
  return (
    <div className={`flex items-start gap-3 py-3 ${!isLast ? "border-b border-slate-100" : ""}`}>
      <div className="shrink-0">
        {ws.previewImage ? (
          <div
            className="relative overflow-hidden rounded-lg border border-slate-200 shadow-sm"
            style={{ width: 52, height: Math.round(52 * 1.414) }}
          >
            <img
              src={ws.previewImage}
              alt={ws.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-xl">
            {FILE_ICONS[ws.fileType] ?? "📄"}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold leading-tight text-slate-800">{ws.title}</p>
        {ws.description && (
          <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">{ws.description}</p>
        )}
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${LEVEL_STYLES[ws.level] ?? ""}`}>
            {ws.level}
          </span>
          <span className="text-[10px] text-slate-400">{ws.fileType}</span>
        </div>
      </div>

      {ws.fileUrl ? (
        <a
          href={ws.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:shadow-md hover:brightness-110"
          title={`ดาวน์โหลด ${ws.title}`}
        >
          <Download size={11} />
          ดาวน์โหลด
        </a>
      ) : (
        <span className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-400">
          ไม่มีลิงก์
        </span>
      )}
    </div>
  );
}

export function LessonWorksheetsPanel({ lessonSlug }: Props) {
  const [worksheets, setWorksheets] = useState<WsItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const config = await fetchWorksheetsConfig();
      if (cancelled) return;
      const items = (config[lessonSlug] ?? [])
        .filter((ws) => ws.visible)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      setWorksheets(items);
    }
    load();
    const id = setInterval(load, 3000);
    return () => { cancelled = true; clearInterval(id); };
  }, [lessonSlug]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50">
          <FileText size={16} className="text-rose-500" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-800">ใบงานประกอบบทเรียน</h3>
          {worksheets.length > 0 && (
            <p className="text-[11px] text-slate-400">{worksheets.length} ใบงาน</p>
          )}
        </div>
      </div>

      <div className="px-4">
        {worksheets.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
              <BookOpen size={22} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-400">ยังไม่มีใบงานสำหรับบทนี้</p>
            <p className="mt-0.5 text-[11px] text-slate-300">ครูจะเพิ่มใบงานให้เร็ว ๆ นี้</p>
          </div>
        ) : (
          <>
            {worksheets.slice(0, 3).map((ws, i) => (
              <WorksheetCard key={ws.id} ws={ws} isLast={i === Math.min(worksheets.length, 3) - 1} />
            ))}
          </>
        )}
      </div>

      {worksheets.length > 3 && (
        <div className="border-t border-slate-100 px-4 py-3">
          <button className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-violet-600 transition hover:bg-violet-50">
            <ExternalLink size={12} />
            ดูใบงานทั้งหมด ({worksheets.length} ใบ)
          </button>
        </div>
      )}

      {worksheets.length > 0 && worksheets.length <= 3 && (
        <div className="border-t border-slate-100 px-4 py-2.5">
          <p className="text-center text-[10px] text-slate-400">
            คลิก &ldquo;ดาวน์โหลด&rdquo; เพื่อเปิดไฟล์จาก Google Drive
          </p>
        </div>
      )}
    </div>
  );
}
