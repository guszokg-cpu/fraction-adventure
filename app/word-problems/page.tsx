import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { WORD_PROBLEMS } from "@/data/wordProblems";
import { WPThumb } from "@/components/word-problems/WPThumb";

export const metadata = {
  title: "โจทย์ปัญหาเศษส่วน | ผจญภัยดินแดนเศษส่วน",
  description: "โจทย์ปัญหาเศษส่วนแบบข้อสอบจริง เลือกดูทีละข้อ พร้อมเฉลยเห็นภาพ แก้ชื่อ/ตัวเลขได้",
};

const THEME = {
  violet: { badge: "bg-violet-600", chip: "bg-violet-100 text-violet-700", ring: "hover:border-violet-400", go: "text-violet-600" },
  sky: { badge: "bg-sky-600", chip: "bg-sky-100 text-sky-700", ring: "hover:border-sky-400", go: "text-sky-600" },
  emerald: { badge: "bg-emerald-600", chip: "bg-emerald-100 text-emerald-700", ring: "hover:border-emerald-400", go: "text-emerald-600" },
  amber: { badge: "bg-amber-500", chip: "bg-amber-100 text-amber-700", ring: "hover:border-amber-400", go: "text-amber-600" },
  rose: { badge: "bg-rose-500", chip: "bg-rose-100 text-rose-700", ring: "hover:border-rose-400", go: "text-rose-600" },
  cyan: { badge: "bg-cyan-600", chip: "bg-cyan-100 text-cyan-700", ring: "hover:border-cyan-400", go: "text-cyan-600" },
  teal: { badge: "bg-teal-600", chip: "bg-teal-100 text-teal-700", ring: "hover:border-teal-400", go: "text-teal-600" },
  indigo: { badge: "bg-indigo-600", chip: "bg-indigo-100 text-indigo-700", ring: "hover:border-indigo-400", go: "text-indigo-600" },
  fuchsia: { badge: "bg-fuchsia-600", chip: "bg-fuchsia-100 text-fuchsia-700", ring: "hover:border-fuchsia-400", go: "text-fuchsia-600" },
} as const;

export default function WordProblemsPage() {
  return (
    <AppShell title="โจทย์ปัญหาเศษส่วน" eyebrow="Word Problems" description="โจทย์แบบข้อสอบจริง เลือกดูทีละข้อ" activePath="/word-problems" hideHeader aside={null}>
      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 p-6 shadow-xl">
          <div className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,.6) 1.5px, transparent 1.6px)", backgroundSize: "16px 16px" }} />
          <div className="relative">
            <h1 className="text-2xl font-extrabold text-white drop-shadow sm:text-3xl">📋 โจทย์ปัญหาเศษส่วน</h1>
            <p className="mt-1 max-w-2xl text-sm font-bold text-white/90">โจทย์แบบข้อสอบจริง — เลือกกดดูทีละข้อได้เลย · ครูแก้ชื่อและตัวเลขได้ ระบบคิดคำตอบให้อัตโนมัติ พร้อมเฉลยทีละขั้นแบบเห็นภาพ</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {WORD_PROBLEMS.map((wp) => {
            const t = THEME[wp.accent];
            return (
              <Link
                key={wp.no}
                href={`/word-problems/${wp.no}`}
                className={`group flex flex-col overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${t.ring}`}
              >
                <div className="relative aspect-[320/190] w-full overflow-hidden border-b border-slate-100">
                  <WPThumb id={wp.id} />
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-3.5">
                  <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${t.chip}`}>ข้อ {wp.no} · {wp.type}</span>
                  <div className="flex items-start gap-2">
                    <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white shadow ${t.badge}`}>{wp.no}</span>
                    <h2 className="text-base font-extrabold leading-snug text-slate-800">{wp.title}</h2>
                  </div>
                  <p className="text-xs font-bold leading-relaxed text-slate-500">{wp.desc}</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-[11px] font-bold text-slate-400">🎯 {wp.concept}</span>
                    <span className={`flex items-center gap-1 text-xs font-extrabold ${t.go}`}>
                      ทำโจทย์ <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
