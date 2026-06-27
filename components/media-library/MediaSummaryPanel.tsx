import { ChevronRight, FolderOpen, Sparkles, BookMarked } from "lucide-react";
import { Card } from "@/components/ui/Card";

const STATS = [
  { label: "ใบงาน", value: 12, emoji: "📝", tile: "bg-amber-50 text-amber-700" },
  { label: "ภาพประกอบ", value: 18, emoji: "🖼️", tile: "bg-emerald-50 text-emerald-700" },
  { label: "วิดีโอ", value: 8, emoji: "🎬", tile: "bg-sky-50 text-sky-700" },
  { label: "เกม", value: 10, emoji: "🎮", tile: "bg-violet-50 text-violet-700" },
  { label: "ลิงก์บทเรียน", value: 10, emoji: "🔗", tile: "bg-rose-50 text-rose-700" },
];

const RECENT = [
  { title: "ใบงานลบเศษส่วน", grade: "ป.5", date: "เพิ่มเมื่อ 15 พ.ค. 2567", emoji: "📝" },
  { title: "ภาพเศษเกินเป็นจำนวนคละ", grade: "ป.6", date: "เพิ่มเมื่อ 14 พ.ค. 2567", emoji: "🖼️" },
  { title: "การเปรียบเทียบเศษส่วน", grade: "ป.5", date: "เพิ่มเมื่อ 13 พ.ค. 2567", emoji: "🎬" },
  { title: "เกมจับคู่เศษส่วน", grade: "ป.5", date: "เพิ่มเมื่อ 12 พ.ค. 2567", emoji: "🎮" },
];

const POPULAR_CATEGORIES = [
  "รู้จักเศษส่วน",
  "เศษส่วนจากภาพ",
  "อ่านและเขียนเศษส่วน",
  "เปรียบเทียบเศษส่วน",
  "บวกเศษส่วน",
  "ลบเศษส่วน",
  "คูณเศษส่วน",
  "หารเศษส่วน",
];

export function MediaSummaryPanel() {
  return (
    <div className="space-y-4">
      {/* สรุปข้อมูลสื่อ */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 bg-gradient-to-r from-brand-700 to-violet-600 px-5 py-4 text-white">
          <FolderOpen size={20} />
          <h2 className="text-lg font-extrabold">สรุปข้อมูลสื่อ</h2>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 rounded-xl bg-violet-50 p-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-violet-600 text-2xl text-white">📦</div>
            <div>
              <div className="text-xs font-bold text-slate-500">สื่อทั้งหมด</div>
              <div className="text-2xl font-extrabold text-brand-900">
                48 <span className="text-sm font-bold text-slate-400">รายการ</span>
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {STATS.map((s) => (
              <div key={s.label} className={`flex items-center gap-2 rounded-xl px-3 py-2 ${s.tile}`}>
                <span className="text-xl">{s.emoji}</span>
                <div className="min-w-0">
                  <div className="truncate text-[11px] font-bold opacity-80">{s.label}</div>
                  <div className="text-lg font-extrabold leading-none">{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* เพิ่มล่าสุด */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-700 px-5 py-4 text-white">
          <Sparkles size={20} />
          <h2 className="text-lg font-extrabold">เพิ่มล่าสุด</h2>
        </div>
        <div className="space-y-2 p-4">
          {RECENT.map((r) => (
            <div key={r.title} className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-xl">{r.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-extrabold text-brand-900">{r.title}</div>
                <div className="text-xs font-bold text-slate-400">{r.date}</div>
              </div>
              <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-extrabold text-brand-700">
                {r.grade}
              </span>
            </div>
          ))}
          <button className="flex w-full items-center justify-center gap-1 rounded-lg border border-brand-100 py-2 text-sm font-extrabold text-brand-600 transition hover:bg-brand-50">
            ดูทั้งหมด <ChevronRight size={14} />
          </button>
        </div>
      </Card>

      {/* หมวดที่ใช้บ่อย */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4 text-white">
          <BookMarked size={20} />
          <h2 className="text-lg font-extrabold">หมวดที่ใช้บ่อย</h2>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {POPULAR_CATEGORIES.map((c) => (
              <span
                key={c}
                className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-extrabold text-brand-700 ring-1 ring-brand-100"
              >
                {c}
              </span>
            ))}
          </div>
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-extrabold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700">
            จัดการหมวดหมู่ <ChevronRight size={15} />
          </button>
        </div>
      </Card>
    </div>
  );
}
