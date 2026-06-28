"use client";

import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Worksheet, WorksheetLevel } from "@/types/worksheet";

const LEVEL_STYLES: Record<WorksheetLevel, string> = {
  พื้นฐาน: "bg-sky-50 text-sky-700",
  ฝึกทักษะ: "bg-amber-50 text-amber-700",
  ท้าทาย: "bg-rose-50 text-rose-700",
};

type Props = {
  worksheets: Worksheet[];
  onEdit: (ws: Worksheet) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string) => void;
};

export function WorksheetTable({ worksheets, onEdit, onDelete, onTogglePublish }: Props) {
  if (worksheets.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 py-16 text-center">
        <p className="text-sm font-semibold text-slate-400">ยังไม่มีใบงาน</p>
        <p className="mt-1 text-xs text-slate-300">กดปุ่ม &ldquo;เพิ่มใบงานใหม่&rdquo; เพื่อเริ่มต้น</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">ลำดับ</th>
              <th className="px-4 py-3">ชื่อใบงาน</th>
              <th className="px-4 py-3">บทเรียน</th>
              <th className="px-4 py-3">ระดับ</th>
              <th className="px-4 py-3">ประเภท</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {worksheets.map((ws) => (
              <tr key={ws.id} className={cn("transition hover:bg-slate-50/60", !ws.isPublished && "opacity-50")}>
                <td className="px-4 py-3 text-slate-400">{ws.sortOrder}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-semibold text-slate-800">{ws.title}</p>
                    {ws.description && (
                      <p className="mt-0.5 max-w-[280px] truncate text-[11px] text-slate-400">{ws.description}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">
                    {ws.lessonSlug}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-lg px-2.5 py-1 text-[11px] font-bold", LEVEL_STYLES[ws.level])}>
                    {ws.level}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{ws.fileType}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
                    ws.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  )}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", ws.isPublished ? "bg-emerald-500" : "bg-slate-400")} />
                    {ws.isPublished ? "เผยแพร่" : "ซ่อน"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onTogglePublish(ws.id)}
                      title={ws.isPublished ? "ซ่อน" : "เผยแพร่"}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      {ws.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => onEdit(ws)}
                      title="แก้ไข"
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-violet-50 hover:text-violet-600"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(ws.id)}
                      title="ลบ"
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
