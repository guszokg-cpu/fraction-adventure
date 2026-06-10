"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  Divide,
  Equal,
  Gamepad2,
  Library,
  LineChart,
  Map,
  Minus,
  Paintbrush,
  Plus,
  Settings,
  Sigma,
  Split,
  Users
} from "lucide-react";
import { mockUser } from "@/data/mockUser";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { pageRoutes } from "@/data/pageRoutes";
import { cn } from "@/lib/cn";
import { toPercent } from "@/lib/progress";

const iconByHref = {
  "/": Map,
  "/lessons/fraction-intro": BookOpen,
  "/lessons/read-write": BookOpen,
  "/lessons/from-images": Paintbrush,
  "/lessons/number-line": Split,
  "/lessons/compare": Sigma,
  "/lessons/equivalent": Equal,
  "/lessons/simplify-expand": Split,
  "/lessons/mixed-improper": Sigma,
  "/lessons/add": Plus,
  "/lessons/subtract": Minus,
  "/lessons/multiply": Sigma,
  "/lessons/divide": Divide,
  "/lessons/word-problems": Gamepad2,
  "/teacher/worksheet-factory": ClipboardList,
  "/teacher/reports": LineChart,
  "/teacher/library": Library,
  "/teacher/classroom": Users,
  "/settings": Settings
};

export function Sidebar({ activePath }: { activePath?: string }) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname;

  return (
    <aside className="flex h-screen w-[300px] shrink-0 flex-col overflow-hidden bg-gradient-to-b from-[#17156f] via-[#3024a9] to-[#4f36d8] px-4 py-4 text-white">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white/12 text-5xl shadow-inner">🍕</div>
        <div>
          <div className="text-2xl font-extrabold leading-tight">ผจญภัย</div>
          <div className="text-3xl font-extrabold leading-tight text-accent-400">ดินแดนเศษส่วน</div>
          <div className="mt-1 text-xs font-semibold leading-relaxed text-white/80">เรียนเศษส่วน ป.4-ป.6<br />ด้วยภาพ เกม และภารกิจ</div>
        </div>
      </div>

      <div className="rounded-xl bg-white/12 p-4 shadow-lg shadow-black/10">
        <div className="flex items-center gap-3">
          <div className="grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-brand-100 text-4xl">👦</div>
          <div className="min-w-0">
            <div className="truncate text-lg font-extrabold">{mockUser.name}</div>
            <div className="text-sm font-semibold text-white/80">{mockUser.gradeLabel}</div>
            <div className="mt-1 inline-flex rounded-full bg-accent-400 px-3 py-1 text-xs font-extrabold text-brand-900">เลเวล {mockUser.level}</div>
          </div>
        </div>
        <ProgressBar value={toPercent(mockUser.xp, mockUser.maxXp)} className="mt-4" />
        <div className="mt-2 text-right text-xs font-bold text-white/85">
          {mockUser.xp} / {mockUser.maxXp} XP
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-white/10 p-3 text-sm font-bold">
        <div>⭐ ดาวสะสม</div>
        <div className="text-right">{mockUser.stars}</div>
        <div>🪙 เหรียญ</div>
        <div className="text-right">{mockUser.coins.toLocaleString()}</div>
      </div>

      <nav className="mt-3 space-y-1 overflow-y-auto pr-1">
        {pageRoutes.map((item) => {
          const Icon = iconByHref[item.href as keyof typeof iconByHref];
          const active = currentPath === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-bold text-white/90 transition hover:bg-white/14",
                active && "bg-accent-400 text-brand-900 hover:bg-accent-400"
              )}
            >
              <Icon size={18} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-3 rounded-xl bg-white/12 p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-white text-4xl">🐰</div>
          <div className="text-xs font-bold leading-relaxed text-white/90">มาเรียนเศษส่วนอย่างเข้าใจและสนุกกันเถอะ!</div>
        </div>
      </div>
    </aside>
  );
}
