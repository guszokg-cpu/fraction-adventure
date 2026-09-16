"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { SidebarBrandCard } from "@/components/layout/SidebarBrandCard";

const ADMIN_KEY = "fa_admin_mode";
const COLLAPSE_KEY = "fa_sidebar_collapsed";

const LESSON_NAV = [
  { href: "/",                          icon: "🗺️",  title: "แผนที่การเรียนรู้" },
  { href: "/lessons/fraction-intro",    icon: "🍕",  title: "รู้จักเศษส่วน" },
  { href: "/lessons/read-write",        icon: "📖",  title: "ประเภทของเศษส่วน" },
  { href: "/lessons/fraction-from-image", icon: "🧩", title: "เศษส่วนจากภาพ" },
  { href: "/lessons/number-line",       icon: "📏",  title: "เศษส่วนบนเส้นจำนวน" },
  { href: "/lessons/compare",           icon: "⚖️",  title: "เปรียบเทียบเศษส่วน" },
  { href: "/lessons/equivalent",        icon: "🔁",  title: "เศษส่วนที่เท่ากัน" },
  { href: "/lessons/simplify-expand",   icon: "🔎",  title: "เศษส่วนอย่างต่ำ" },
  { href: "/lessons/mixed-improper",    icon: "1¼",  title: "จำนวนคละและเศษเกิน" },
  { href: "/lessons/add",               icon: "➕",  title: "บวกเศษส่วน" },
  { href: "/lessons/subtract",          icon: "➖",  title: "ลบเศษส่วน" },
  { href: "/lessons/multiply",          icon: "✖️",  title: "คูณเศษส่วน" },
  { href: "/lessons/divide",            icon: "➗",  title: "หารเศษส่วน" },
];

const RESOURCE_NAV = [
  { href: "/games",         icon: "🎮", title: "เกมเศษส่วน" },
  { href: "/word-problems", icon: "📋", title: "โจทย์ปัญหา" },
  { href: "/media-library", icon: "🗂️", title: "คลังสื่อการสอน" },
];

const ADMIN_NAV = [
  { href: "/admin/worksheets", icon: "📋", title: "จัดการใบงาน" },
  { href: "/settings",         icon: "⚙️", title: "ตั้งค่าระบบ" },
];

export function Sidebar({ activePath }: { activePath?: string }) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname;
  const [isAdmin, setIsAdmin] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const check = () => setIsAdmin(sessionStorage.getItem(ADMIN_KEY) === "1");
    check();
    window.addEventListener("storage", check);
    const id = setInterval(check, 1000);
    return () => { window.removeEventListener("storage", check); clearInterval(id); };
  }, []);

  // โหลดค่าย่อ/ขยายที่จำไว้ — รอ mount ก่อนค่อยแสดง กันจอกระพริบจาก SSR mismatch
  useEffect(() => {
    try { setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1"); } catch { /* ignore */ }
    setReady(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  }

  const navLink = (item: { href: string; icon: string; title: string }, tone: "default" | "admin" = "default") => {
    const active = currentPath === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.title : undefined}
        className={cn(
          "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12px] font-bold transition-all duration-200",
          collapsed && "justify-center px-0",
          tone === "default" && "text-white/80 hover:-translate-y-px hover:translate-x-1 hover:bg-white/15 hover:text-white",
          tone === "default" && active && "bg-white/20 font-extrabold text-white shadow-sm",
          tone === "admin" && "text-amber-200/80 hover:bg-amber-400/20 hover:text-amber-100",
          tone === "admin" && active && "bg-amber-400/25 font-extrabold text-amber-100"
        )}
      >
        {tone === "default" && active && !collapsed && <span aria-hidden className="absolute left-0 top-[7px] bottom-[7px] w-[3px] rounded-full bg-white/40" />}
        <span className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[14px] leading-none transition-all duration-200",
          tone === "default" && "bg-white/12 group-hover:bg-white/24 group-hover:scale-110",
          tone === "default" && active && "bg-white/20",
          tone === "admin" && "bg-amber-400/20 group-hover:scale-110"
        )}>
          {item.icon}
        </span>
        {!collapsed && <span className="truncate">{item.title}</span>}
      </Link>
    );
  };

  return (
    <aside className={cn(
      "hidden sticky top-0 h-screen shrink-0 flex-col bg-gradient-to-b from-[#1e1b4b] via-[#312e81] to-[#3730a3] text-white lg:flex",
      ready && "transition-[width] duration-200",
      collapsed ? "w-[68px]" : "w-[260px]"
    )}>

      {/* Brand + ปุ่มย่อ/ขยาย */}
      <div className={cn("shrink-0 px-3 pt-3", collapsed && "px-2")}>
        {collapsed ? (
          <button
            onClick={toggleCollapsed}
            title="ขยายเมนู"
            className="grid h-10 w-10 mx-auto place-items-center rounded-xl bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="min-w-0 flex-1">
              <SidebarBrandCard />
            </div>
            <button
              onClick={toggleCollapsed}
              title="ย่อเมนู"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={cn("mt-3 flex-1 min-h-0 overflow-y-auto pb-2 scrollbar-thin", collapsed ? "px-2" : "px-2.5")}>

        {/* บทเรียน */}
        {!collapsed && (
          <div className="mb-1 mt-2 flex items-center gap-1.5 px-1.5">
            <div className="h-px flex-1 bg-white/15" />
            <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-white/40">บทเรียน</span>
            <div className="h-px flex-1 bg-white/15" />
          </div>
        )}

        <div className="space-y-0.5">
          {LESSON_NAV.map((item) => navLink(item))}
        </div>

        {/* สื่อการสอน — ทุกคนเห็น */}
        {!collapsed && (
          <div className="mb-1 mt-4 flex items-center gap-1.5 px-1.5">
            <div className="h-px flex-1 bg-white/15" />
            <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-white/40">สื่อการสอน</span>
            <div className="h-px flex-1 bg-white/15" />
          </div>
        )}
        {collapsed && <div className="my-3 h-px bg-white/15" />}
        <div className="space-y-0.5">
          {RESOURCE_NAV.map((item) => navLink(item))}
        </div>

        {/* Admin section — เฉพาะเมื่อ login แล้ว */}
        {isAdmin && (
          <>
            {!collapsed && (
              <div className="mb-1 mt-4 flex items-center gap-1.5 px-1.5">
                <div className="h-px flex-1 bg-amber-400/30" />
                <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-amber-300/70">🛡️ แอดมิน</span>
                <div className="h-px flex-1 bg-amber-400/30" />
              </div>
            )}
            {collapsed && <div className="my-3 h-px bg-amber-400/30" />}
            <div className="space-y-0.5">
              {ADMIN_NAV.map((item) => navLink(item, "admin"))}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="shrink-0 px-3 pb-3 pt-1">
          <div className="flex items-center gap-2 rounded-xl bg-white/10 p-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-2xl">🐻</div>
            <div className="text-[10px] font-bold leading-snug text-white/80">
              เรียนเศษส่วนสนุกได้ทุกวัน!
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
