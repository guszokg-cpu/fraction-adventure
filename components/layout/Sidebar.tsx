"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { X, Lock, Eye, EyeOff } from "lucide-react";
import { mockUser } from "@/data/mockUser";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { pageRoutes } from "@/data/pageRoutes";
import { cn } from "@/lib/cn";
import { toPercent } from "@/lib/progress";
import { SidebarBrandCard } from "@/components/layout/SidebarBrandCard";
import { StudentLoginModal } from "@/components/layout/StudentLoginModal";
import { getStudentSession, setStudentSession, clearStudentSession } from "@/lib/studentSession";
import { getAdminPassword } from "@/lib/systemSettings";
import type { StudentSession } from "@/lib/studentSession";

// ── Role types ────────────────────────────────────────────────────────────
export type SidebarRole = "guest" | "student" | "teacher" | "admin";

// รหัสผ่านเริ่มต้น "admin1234" — เปลี่ยนได้ผ่าน /settings หรือแก้ใน lib/systemSettings.ts
function getAdminPw() { return typeof window !== "undefined" ? getAdminPassword() : "admin1234"; }

const ROLE_CONFIG: Record<SidebarRole, { label: string; icon: string; activeCls: string; badgeCls: string }> = {
  guest:   { label: "ผู้เยี่ยมชม", icon: "👤",  activeCls: "bg-slate-300 text-slate-800 shadow-sm",                                      badgeCls: "bg-slate-200 text-slate-700" },
  student: { label: "นักเรียน",   icon: "👨‍🎓", activeCls: "bg-accent-400 text-brand-900 shadow-[0_2px_8px_rgba(251,191,36,0.40)]",       badgeCls: "bg-accent-400 text-brand-900" },
  teacher: { label: "ครู",        icon: "👩‍🏫", activeCls: "bg-emerald-400 text-emerald-950 shadow-[0_2px_8px_rgba(52,211,153,0.40)]",    badgeCls: "bg-emerald-400 text-emerald-950" },
  admin:   { label: "แอดมิน",    icon: "🛡️",  activeCls: "bg-rose-400 text-white shadow-[0_2px_8px_rgba(251,113,133,0.40)]",            badgeCls: "bg-rose-500 text-white" },
};

// ── Nav sections ──────────────────────────────────────────────────────────
const FOUNDATION    = ["/", "/lessons/fraction-intro", "/lessons/read-write"];
const LESSONS       = ["/lessons/fraction-from-image", "/lessons/number-line", "/lessons/compare", "/lessons/equivalent", "/lessons/simplify-expand", "/lessons/mixed-improper", "/lessons/add", "/lessons/subtract", "/lessons/multiply", "/lessons/divide", "/lessons/word-problems"];
const TEACHER_TOOLS = ["/teacher/reports", "/teacher/classroom"];
const ADMIN_TOOLS   = ["/admin/worksheets", "/media-library", "/settings"];

type NavSection = { label: string; hrefs: string[] };

const NAV_BY_ROLE: Record<SidebarRole, NavSection[]> = {
  guest:   [{ label: "พื้นฐาน", hrefs: FOUNDATION }, { label: "การคำนวณ", hrefs: LESSONS }],
  student: [{ label: "พื้นฐาน", hrefs: FOUNDATION }, { label: "การคำนวณ", hrefs: LESSONS }],
  teacher: [{ label: "พื้นฐาน", hrefs: FOUNDATION }, { label: "การคำนวณ", hrefs: LESSONS }, { label: "เครื่องมือครู", hrefs: TEACHER_TOOLS }],
  admin:   [{ label: "พื้นฐาน", hrefs: FOUNDATION }, { label: "การคำนวณ", hrefs: LESSONS }, { label: "เครื่องมือครู", hrefs: TEACHER_TOOLS }, { label: "แอดมิน", hrefs: ADMIN_TOOLS }],
};

const routeMap = Object.fromEntries(pageRoutes.map((r) => [r.href, r]));
const LS_ROLE_KEY = "sidebar_role";

// ── Admin Password Modal ──────────────────────────────────────────────────
function AdminPasswordModal({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80); }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pw === getAdminPw()) { onSuccess(); }
    else { setError(true); setPw(""); setTimeout(() => setError(false), 2000); }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <button aria-label="ปิด" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-rose-600 to-pink-500 px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/20"><Lock size={16} /></div>
            <div>
              <p className="text-sm font-extrabold">เข้าสู่โหมดแอดมิน</p>
              <p className="text-[11px] text-white/70">กรุณาใส่รหัสผ่าน</p>
            </div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/20 transition hover:bg-white/30"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-sm font-extrabold text-slate-600">รหัสผ่านแอดมิน</label>
            <div className="relative">
              <input ref={inputRef} type={showPw ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••"
                className={cn("h-11 w-full rounded-xl border px-3 pr-10 text-sm font-bold text-slate-700 outline-none transition",
                  error ? "border-rose-400 bg-rose-50" : "border-slate-200 bg-slate-50 focus:border-rose-400 focus:bg-white")} />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="mt-1.5 text-[11px] font-bold text-rose-500">❌ รหัสผ่านไม่ถูกต้อง</p>}
          </div>
          <div className="flex gap-2.5">
            <button type="button" onClick={onClose} className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50">ยกเลิก</button>
            <button type="submit" disabled={!pw} className="h-11 flex-1 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-sm font-extrabold text-white shadow-sm transition hover:brightness-110 disabled:opacity-50">เข้าสู่ระบบ</button>
          </div>
          <p className="text-center text-[10px] text-slate-400">รหัสเริ่มต้น: <code className="rounded bg-slate-100 px-1 font-mono">admin1234</code></p>
        </form>
      </div>
    </div>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────────────
export function Sidebar({ activePath }: { activePath?: string }) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname;

  const [role, setRole] = useState<SidebarRole>("guest");
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<StudentSession | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem(LS_ROLE_KEY) as SidebarRole | null;
    const savedSession = getStudentSession();
    if (savedRole && savedRole in ROLE_CONFIG) setRole(savedRole);
    if (savedSession) setSession(savedSession);
    setMounted(true);
  }, []);

  function switchRole(r: SidebarRole) {
    setRole(r);
    localStorage.setItem(LS_ROLE_KEY, r);
  }

  function handleRoleClick(r: SidebarRole) {
    if (r === "admin" && role !== "admin") { setShowAdminModal(true); return; }
    if (r === "student") { setShowStudentModal(true); return; }
    if (r === "guest") { clearStudentSession(); setSession(null); }
    switchRole(r);
  }

  function handleStudentSuccess(s: StudentSession) {
    setStudentSession(s);
    setSession(s);
    setShowStudentModal(false);
    switchRole("student");
  }

  const cfg = ROLE_CONFIG[role];
  const sections = NAV_BY_ROLE[role];

  const sidebarGradient =
    role === "admin"   ? "from-[#3b0a12] via-[#7f1d2b] to-[#b91c3c]" :
    role === "teacher" ? "from-[#064e3b] via-[#065f46] to-[#047857]" :
    role === "student" ? "from-[#17156f] via-[#3024a9] to-[#4f36d8]" :
    "from-[#1e1b4b] via-[#312e81] to-[#3730a3]"; // guest: indigo muted

  return (
    <>
      <aside className={cn(
        "hidden sticky top-0 h-screen w-[280px] shrink-0 flex-col text-white lg:flex",
        "bg-gradient-to-b transition-colors duration-500",
        sidebarGradient,
      )}>
        {/* ── Header ── */}
        <div className="shrink-0 space-y-3 px-3 pt-3">
          <SidebarBrandCard />

          {/* Role/mode badge */}
          {mounted && role !== "guest" && (
            <div className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl py-1 text-[11px] font-extrabold tracking-wide",
              role === "admin"   ? "bg-rose-500/30 text-rose-200" :
              role === "teacher" ? "bg-emerald-500/30 text-emerald-200" :
              "bg-accent-400/20 text-accent-300"
            )}>
              <span>{cfg.icon}</span>
              <span>โหมด{cfg.label}</span>
              {role === "admin" && <span className="rounded-full bg-rose-400/40 px-1.5 py-0.5 text-[9px]">ADMIN</span>}
            </div>
          )}

          {/* Profile card — แตกต่างตาม role */}
          {role === "guest" ? (
            <div className="rounded-xl bg-white/10 p-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-white/30 bg-white/15 text-2xl">👤</div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold">ผู้เยี่ยมชม</p>
                  <p className="text-[11px] text-white/60">กำลังเล่นแบบไม่มีบัญชี</p>
                  <button
                    onClick={() => setShowStudentModal(true)}
                    className="mt-0.5 text-[10px] font-bold text-yellow-300 transition hover:underline"
                  >
                    เข้าห้องเรียน เพื่อสะสมแต้ม →
                  </button>
                </div>
              </div>
            </div>
          ) : role === "student" && session ? (
            <div className="rounded-xl bg-white/12 p-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-white bg-brand-100 text-2xl">👦</div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold">{session.studentName}</div>
                  <div className="text-[11px] text-white/70">{session.grade} • {session.className}</div>
                  <div className="text-[10px] text-white/50">{session.teacherName}</div>
                </div>
              </div>
              <ProgressBar value={toPercent(mockUser.xp, mockUser.maxXp)} className="mt-2" />
              <div className="mt-1 text-right text-[10px] font-bold text-white/80">
                {mockUser.xp} / {mockUser.maxXp} XP
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-white/12 p-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-white bg-brand-100 text-2xl">
                  {role === "admin" ? "🛡️" : "👩‍🏫"}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold">{mockUser.name}</div>
                  <div className="text-xs font-semibold text-white/80">{mockUser.gradeLabel}</div>
                  <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold", cfg.badgeCls)}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
              </div>
              <ProgressBar value={toPercent(mockUser.xp, mockUser.maxXp)} className="mt-2" />
              <div className="mt-1 text-right text-[10px] font-bold text-white/80">
                {mockUser.xp} / {mockUser.maxXp} XP
              </div>
            </div>
          )}

          {/* Stats — ซ่อนสำหรับ Guest */}
          {role !== "guest" && (
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/10 p-2 text-xs font-bold">
              <div>⭐ ดาวสะสม</div>
              <div className="text-right">{mockUser.stars}</div>
              <div>🪙 เหรียญ</div>
              <div className="text-right">{mockUser.coins.toLocaleString()}</div>
            </div>
          )}

          {role === "guest" && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-[10px] text-white/50">
              เล่นได้ทุกบทเรียนโดยไม่ต้องลงทะเบียน
            </div>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className="mt-2 flex-1 min-h-0 overflow-y-auto px-2.5 pb-2 scrollbar-thin">
          {sections.map((section) => {
            const items = section.hrefs.map((h) => routeMap[h]).filter(Boolean);
            if (!items.length) return null;
            const isAdminSection = section.label === "แอดมิน";

            return (
              <div key={section.label} className="mb-2">
                <div className="mb-1 mt-3 flex items-center gap-1.5 px-1.5">
                  <div className={cn("h-px flex-1", isAdminSection ? "bg-rose-400/30" : "bg-white/15")} />
                  <span className={cn("text-[9px] font-extrabold uppercase tracking-[0.12em]",
                    isAdminSection ? "text-rose-300/70" : "text-white/40")}>
                    {isAdminSection && "🛡️ "}{section.label}
                  </span>
                  <div className={cn("h-px flex-1", isAdminSection ? "bg-rose-400/30" : "bg-white/15")} />
                </div>

                <div className="space-y-0.5">
                  {items.map((item) => {
                    const active = currentPath === item.href;
                    return (
                      <Link key={item.href} href={item.href}
                        className={cn(
                          "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12px] font-bold",
                          "transition-all duration-[220ms] ease-out text-white/80",
                          "hover:-translate-y-px hover:translate-x-1 hover:scale-[1.02] hover:text-white",
                          !active && "hover:bg-white/15 hover:shadow-[0_4px_12px_rgba(0,0,0,0.30)]",
                          active && [cfg.activeCls, "font-extrabold", "hover:brightness-110 hover:text-current"]
                        )}>
                        {active && <span aria-hidden className="absolute left-0 top-[7px] bottom-[7px] w-[3px] rounded-full bg-black/20" />}
                        <span className={cn(
                          "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[14px] leading-none",
                          "transition-all duration-[220ms] ease-out bg-white/12",
                          "group-hover:bg-white/24 group-hover:scale-110 group-hover:shadow-sm",
                          active && "bg-black/15 group-hover:bg-black/20")}>
                          {item.icon}
                        </span>
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

        {/* ── Footer: 2×2 mode switcher ── */}
        <div className="shrink-0 space-y-2 px-3 pb-3 pt-1">
          <div className="flex items-center gap-2 rounded-xl bg-white/12 p-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-2xl">🐻</div>
            <div className="text-[10px] font-bold leading-snug text-white/90">
              ทำภารกิจวันละนิด ก็เก่งเศษส่วนได้!
            </div>
          </div>

          <div className="rounded-xl bg-white/10 p-2">
            <p className="mb-1.5 text-center text-[10px] font-extrabold text-white/60">เปลี่ยนโหมด</p>
            {/* 2×2 grid */}
            <div className="grid grid-cols-2 gap-1">
              {(["guest", "student", "teacher", "admin"] as SidebarRole[]).map((r) => {
                const c = ROLE_CONFIG[r];
                const isActive = mounted && role === r;
                return (
                  <button key={r} onClick={() => handleRoleClick(r)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-extrabold transition-all duration-200",
                      isActive ? c.activeCls : "bg-white/12 text-white/70 hover:bg-white/22 hover:text-white"
                    )}>
                    <span className="text-base leading-none">{c.icon}</span>
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {showAdminModal && (
        <AdminPasswordModal
          onSuccess={() => { switchRole("admin"); setShowAdminModal(false); }}
          onClose={() => setShowAdminModal(false)}
        />
      )}
      {showStudentModal && (
        <StudentLoginModal
          onSuccess={handleStudentSuccess}
          onClose={() => setShowStudentModal(false)}
        />
      )}
    </>
  );
}
