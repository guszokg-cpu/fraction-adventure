import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { WORD_PROBLEMS, getWP } from "@/data/wordProblems";
import { WordProblemRenderer } from "@/components/word-problems/WordProblemRenderer";

export function generateStaticParams() {
  return WORD_PROBLEMS.map((w) => ({ no: String(w.no) }));
}

export function generateMetadata({ params }: { params: { no: string } }) {
  const wp = getWP(Number(params.no));
  return {
    title: wp ? `โจทย์ที่ ${wp.no} · ${wp.title} | โจทย์ปัญหาเศษส่วน` : "โจทย์ปัญหาเศษส่วน",
  };
}

export default function WordProblemPage({ params }: { params: { no: string } }) {
  const no = Number(params.no);
  const wp = getWP(no);
  if (!wp) notFound();

  const prev = getWP(no - 1);
  const next = getWP(no + 1);

  return (
    <AppShell title={wp.title} eyebrow="Word Problems" description={wp.desc} activePath="/word-problems" hideHeader aside={null}>
      <div className="space-y-4">
        {/* หัวเรื่อง + ลิงก์กลับ */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href="/word-problems" className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50">
            <ArrowLeft size={15} /> รวมโจทย์ทั้งหมด
          </Link>
          <span className="text-sm font-bold text-slate-400">โจทย์ที่ {wp.no} จาก {WORD_PROBLEMS.length}</span>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 p-5 shadow-xl">
          <div className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,.6) 1.5px, transparent 1.6px)", backgroundSize: "16px 16px" }} />
          <div className="relative flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/20 text-xl font-extrabold text-white">{wp.no}</span>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-white/70">{wp.type}</p>
              <h1 className="text-xl font-extrabold text-white drop-shadow sm:text-2xl">{wp.title}</h1>
            </div>
          </div>
        </div>

        {/* ตัวโจทย์ */}
        <WordProblemRenderer id={wp.id} />

        {/* นำทางก่อนหน้า/ถัดไป */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {prev ? (
            <Link href={`/word-problems/${prev.no}`} className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white p-3 text-left transition hover:border-violet-300 hover:bg-violet-50">
              <ChevronLeft size={20} className="shrink-0 text-violet-500" />
              <span className="min-w-0">
                <span className="block text-[11px] font-bold text-slate-400">โจทย์ก่อนหน้า</span>
                <span className="block truncate text-sm font-extrabold text-slate-700">{prev.no}. {prev.title}</span>
              </span>
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/word-problems/${next.no}`} className="flex items-center justify-end gap-2 rounded-2xl border-2 border-slate-200 bg-white p-3 text-right transition hover:border-violet-300 hover:bg-violet-50">
              <span className="min-w-0">
                <span className="block text-[11px] font-bold text-slate-400">โจทย์ถัดไป</span>
                <span className="block truncate text-sm font-extrabold text-slate-700">{next.no}. {next.title}</span>
              </span>
              <ChevronRight size={20} className="shrink-0 text-violet-500" />
            </Link>
          ) : <span />}
        </div>

        <Link href="/word-problems" className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
          <LayoutGrid size={16} /> ดูโจทย์ข้ออื่น
        </Link>
      </div>
    </AppShell>
  );
}
