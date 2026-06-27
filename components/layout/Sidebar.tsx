"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockUser } from "@/data/mockUser";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { pageRoutes } from "@/data/pageRoutes";
import { cn } from "@/lib/cn";
import { toPercent } from "@/lib/progress";
import { SidebarBrandCard } from "@/components/layout/SidebarBrandCard";

const routeMap = Object.fromEntries(pageRoutes.map((r) => [r.href, r]));

const NAV_SECTIONS = [
  {
    label: "พื้นฐาน",
    hrefs: ["/", "/lessons/fraction-intro", "/lessons/read-write"],
  },
  {
    label: "การคำนวณ",
    hrefs: [
      "/lessons/fraction-from-image",
      "/lessons/number-line",
      "/lessons/compare",
      "/lessons/equivalent",
      "/lessons/simplify-expand",
      "/lessons/mixed-improper",
      "/lessons/add",
      "/lessons/subtract",
      "/lessons/multiply",
      "/lessons/divide",
      "/lessons/word-problems",
    ],
  },
  {
    label: "เครื่องมือ",
    hrefs: ["/teacher/reports", "/media-library", "/teacher/classroom", "/settings"],
  },
];

export function Sidebar({ activePath }: { activePath?: string }) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname;

  return (
    <aside className="hidden sticky top-0 h-screen w-[280px] shrink-0 flex-col bg-gradient-to-b from-[#17156f] via-[#3024a9] to-[#4f36d8] text-white lg:flex">

      {/* ─── Header: Brand Card + Profile + Stats ─── */}
      <div className="shrink-0 space-y-3 px-3 pt-3">
        <SidebarBrandCard />

        <div className="rounded-xl bg-white/12 p-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-white bg-brand-100 text-2xl">👦</div>
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold">{mockUser.name}</div>
              <div className="text-xs font-semibold text-white/80">{mockUser.gradeLabel}</div>
              <span className="inline-flex rounded-full bg-accent-400 px-2 py-0.5 text-[10px] font-extrabold text-brand-900">
                เลเวล {mockUser.level}
              </span>
            </div>
          </div>
          <ProgressBar value={toPercent(mockUser.xp, mockUser.maxXp)} className="mt-2" />
          <div className="mt-1 text-right text-[10px] font-bold text-white/80">
            {mockUser.xp} / {mockUser.maxXp} XP
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/10 p-2 text-xs font-bold">
          <div>⭐ ดาวสะสม</div>
          <div className="text-right">{mockUser.stars}</div>
          <div>🪙 เหรียญ</div>
          <div className="text-right">{mockUser.coins.toLocaleString()}</div>
        </div>
      </div>

      {/* ─── Nav: Scrollable with section groupings ─── */}
      <nav className="mt-2 flex-1 min-h-0 overflow-y-auto px-2.5 pb-2 scrollbar-thin">
        {NAV_SECTIONS.map((section) => {
          const items = section.hrefs.map((h) => routeMap[h]).filter(Boolean);
          if (!items.length) return null;

          return (
            <div key={section.label} className="mb-2">
              {/* Section label */}
              <div className="mb-1 mt-3 flex items-center gap-1.5 px-1.5">
                <div className="h-px flex-1 bg-white/15" />
                <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-white/40">
                  {section.label}
                </span>
                <div className="h-px flex-1 bg-white/15" />
              </div>

              <div className="space-y-0.5">
                {items.map((item) => {
                  const active = currentPath === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        // Base: pill card
                        "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12px] font-bold",
                        // Smooth transition for ALL properties
                        "transition-all duration-[220ms] ease-out",
                        // Default text
                        "text-white/80",
                        // Hover effects — translate + scale + shadow + brighter bg + brighter text
                        // Tailwind `hover:` only fires on pointer devices (not touch-only)
                        "hover:-translate-y-px hover:translate-x-1 hover:scale-[1.02]",
                        "hover:text-white",
                        !active && [
                          "hover:bg-white/15",
                          "hover:shadow-[0_4px_12px_rgba(0,0,0,0.30)]",
                        ],
                        // Active state: accent bg + stronger shadow + extra font weight
                        active && [
                          "bg-accent-400 text-brand-900 font-extrabold",
                          "shadow-[0_4px_16px_rgba(251,191,36,0.35)]",
                          // Override hover so active stays gold
                          "hover:bg-accent-400/90 hover:text-brand-900",
                          "hover:shadow-[0_6px_18px_rgba(251,191,36,0.45)]",
                        ]
                      )}
                    >
                      {/* Active: left accent stripe */}
                      {active && (
                        <span
                          aria-hidden
                          className="absolute left-0 top-[7px] bottom-[7px] w-[3px] rounded-full bg-brand-900/35"
                        />
                      )}

                      {/* Icon badge */}
                      <span
                        className={cn(
                          "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[14px] leading-none",
                          "transition-all duration-[220ms] ease-out",
                          "bg-white/12",
                          // Icon badge brightens + scales up on hover
                          "group-hover:bg-white/24 group-hover:scale-110 group-hover:shadow-sm",
                          active && "bg-brand-900/15 group-hover:bg-brand-900/22"
                        )}
                      >
                        {item.icon}
                      </span>

                      {/* Label — tiny nudge right on hover */}
                      <span className="truncate transition-transform duration-[220ms] ease-out group-hover:translate-x-0.5">
                        {item.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ─── Footer: Mascot + mode switch ─── */}
      <div className="shrink-0 space-y-2 px-3 pb-3 pt-1">
        <div className="flex items-center gap-2 rounded-xl bg-white/12 p-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-2xl">🐻</div>
          <div className="text-[10px] font-bold leading-snug text-white/90">
            ทำภารกิจวันละนิด ก็เก่งเศษส่วนได้!
          </div>
        </div>

        <div className="rounded-xl bg-white/10 p-2">
          <p className="mb-1.5 text-center text-[10px] font-extrabold text-white/60">เปลี่ยนโหมด</p>
          <div className="grid grid-cols-2 gap-1.5">
            <button className="rounded-lg bg-accent-400 py-1.5 text-[11px] font-extrabold text-brand-900 shadow transition-all duration-200 hover:bg-accent-300 hover:shadow-md">
              👨‍🎓 นักเรียน
            </button>
            <button className="rounded-lg bg-white/15 py-1.5 text-[11px] font-extrabold text-white/80 transition-all duration-200 hover:bg-white/25 hover:text-white">
              👩‍🏫 ครู
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
