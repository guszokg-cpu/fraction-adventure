"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, BookOpen, Search } from "lucide-react";
import { WorksheetTable } from "@/components/admin/worksheets/WorksheetTable";
import { WorksheetForm } from "@/components/admin/worksheets/WorksheetForm";
import { loadWorksheets, saveWorksheets } from "@/lib/worksheetStore";
import type { Worksheet } from "@/types/worksheet";

type FormData = Omit<Worksheet, "id" | "createdAt" | "updatedAt">;

const LESSON_LABELS: Record<string, string> = {
  "fraction-intro":      "บทที่ 1 – รู้จักเศษส่วน",
  "read-write":          "บทที่ 2 – อ่านและเขียนเศษส่วน",
  "fraction-from-image": "บทที่ 3 – เศษส่วนจากภาพ",
  "number-line":         "บทที่ 4 – เส้นจำนวน",
  "compare":             "บทที่ 5 – เปรียบเทียบ",
  "equivalent":          "บทที่ 6 – เศษส่วนเท่ากัน",
  "simplify-expand":     "บทที่ 7 – ทำให้เป็นอย่างต่ำ",
  "mixed-improper":      "บทที่ 8 – เศษเกิน/จำนวนคละ",
  "add":                 "บทที่ 9 – บวก",
  "subtract":            "บทที่ 10 – ลบ",
  "multiply":            "บทที่ 11 – คูณ",
  "divide":              "บทที่ 12 – หาร",
};

export function AdminWorksheetsContent() {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filterSlug, setFilterSlug] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Worksheet | null>(null);

  useEffect(() => {
    setWorksheets(loadWorksheets());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveWorksheets(worksheets);
  }, [worksheets, loaded]);

  const lessonSlugs = useMemo(() => [...new Set(worksheets.map((w) => w.lessonSlug))].sort(), [worksheets]);

  const filtered = useMemo(() =>
    worksheets.filter((w) => {
      const matchSlug = filterSlug === "all" || w.lessonSlug === filterSlug;
      const matchSearch = !search || w.title.includes(search) || w.description.includes(search);
      return matchSlug && matchSearch;
    }), [worksheets, filterSlug, search]);

  function handleSave(data: FormData) {
    if (editTarget) {
      setWorksheets((prev) => prev.map((w) => w.id === editTarget.id ? { ...w, ...data, updatedAt: new Date().toISOString() } : w));
    } else {
      const newWs: Worksheet = { ...data, id: `ws-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setWorksheets((prev) => [...prev, newWs]);
    }
    setShowForm(false);
    setEditTarget(null);
  }

  function handleDelete(id: string) {
    if (!confirm("ต้องการลบใบงานนี้?")) return;
    setWorksheets((prev) => prev.filter((w) => w.id !== id));
  }

  function handleTogglePublish(id: string) {
    setWorksheets((prev) => prev.map((w) => w.id === id ? { ...w, isPublished: !w.isPublished, updatedAt: new Date().toISOString() } : w));
  }

  if (!loaded) return <div className="py-16 text-center text-sm font-bold text-slate-400">กำลังโหลด...</div>;

  return (
    <div className="space-y-5">
      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "ใบงานทั้งหมด",     value: worksheets.length,                              icon: "📄", color: "text-violet-600 bg-violet-50" },
            { label: "เผยแพร่แล้ว",       value: worksheets.filter((w) => w.isPublished).length,  icon: "✅", color: "text-emerald-600 bg-emerald-50" },
            { label: "ซ่อนอยู่",          value: worksheets.filter((w) => !w.isPublished).length, icon: "🙈", color: "text-slate-500 bg-slate-100" },
            { label: "บทที่มีใบงาน",      value: lessonSlugs.length,                             icon: "📚", color: "text-sky-600 bg-sky-50" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${s.color}`}>{s.icon}</span>
              <div>
                <p className="text-xl font-extrabold text-slate-800">{s.value}</p>
                <p className="text-[10px] text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => { setEditTarget(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
        >
          <Plus size={16} />
          เพิ่มใบงานใหม่
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
          <Search size={14} className="shrink-0 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อใบงาน..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-slate-700 outline-none placeholder:text-slate-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-slate-400" />
          <select
            value={filterSlug}
            onChange={(e) => setFilterSlug(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-violet-400"
          >
            <option value="all">ทุกบทเรียน</option>
            {lessonSlugs.map((slug) => (
              <option key={slug} value={slug}>{LESSON_LABELS[slug] ?? slug}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-400">แสดง {filtered.length} / {worksheets.length} รายการ</p>
      </div>

      <WorksheetTable worksheets={filtered} onEdit={(ws) => { setEditTarget(ws); setShowForm(true); }} onDelete={handleDelete} onTogglePublish={handleTogglePublish} />

      <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 px-5 py-3">
        <p className="text-xs font-bold text-emerald-700">💾 บันทึกอัตโนมัติ — ข้อมูลเก็บในเครื่องนี้และแสดงในหน้าบทเรียนทันทีหลังรีโหลด</p>
      </div>

      {showForm && (
        <WorksheetForm
          initial={editTarget}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
}
