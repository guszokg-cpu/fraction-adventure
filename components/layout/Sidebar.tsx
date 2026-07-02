"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { SidebarBrandCard } from "@/components/layout/SidebarBrandCard";

const ADMIN_KEY = "fa_admin_mode";

const LESSON_NAV = [
  { href: "/",                          icon: "🗺️",  title: "แผนที่การเรียนรู้" },
  { href: "/lessons/fraction-intro",    icon: "🍕",  title: "รู้จักเศษส่วน" },
  { href: "/lessons/read-write",        icon: "📖",  title: "ประเภทของเศษส่วน" },
  { href: "/lessons/fraction-from-image", icon: "🧩", title: "เศษส่วนจากภาพ" },
  { href: "/lessons/number-line",       icon: "📏",  title: "เศษส่วนบนเส้นจำนวน" },
  { href: "/lessons/compare",           icon: "⚖️",  title: "เปรียบเทียบเศษส่วน" },
  { href: "/lessons/equivalent",        icon: "🔁",  title: "เศษส่วนที่เท่ากัน" },
  { href: "/lessons/simplify-expand",   icon: "🔎",  title: "ย่อและขยายเศษส่วน" },
  { href: "/lessons/mixed-improper",    icon: "1¼",  title: "จำนวนคละและเศษเกิน" },
  { href: "/lessons/add",               icon: "➕",  title: "บวกเศษส่วน" },
  { href: "/lessons/subtract",          icon: "➖",  title: "ลบเศษส่วน" },
  { href: "/lessons/multiply",          icon: "✖️",  title: "คูณเศษส่วน" },
  { href: "/lessons/divide",            icon: "➗",  title: "หารเศษส่วน" },
];

const RESOURCE_NAV = [
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

  useEffect(() => {
    const check = () => setIsAdmin(sessionStorage.getItem(ADMIN_KEY) === "1");
    check();
    window.addEventListener("storage", check);
    const id = setInterval(check, 1000);
    return () => { window.removeEventListener("storage", check); clearInterval(id); };
  }, []);

  return (
    <aside className="hidden sticky top-0 h-screen w-[260px] shrink-0 flex-col bg-gradient-to-b from-[#1e1b4b] via-[#312e81] to-[#3730a3] text-white lg:flex">

      {/* Brand */}
      <div className="shrink-0 px-3 pt-3">
        <SidebarBrandCard />
      </div>

      {/* Nav */}
      <nav className="mt-3 flex-1 min-h-0 overflow-y-auto px-2.5 pb-2 scrollbar-thin">

        {/* บทเรียน */}
        <div className="mb-1 mt-2 flex items-center gap-1.5 px-1.5">
          <div className="h-px flex-1 bg-white/15" />
          <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-white/40">บทเรียน</span>
          <div className="h-px flex-1 bg-white/15" />
        </div>

        <div className="space-y-0.5">
          {LESSON_NAV.map((item) => {
            const active = currentPath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12px] font-bold transition-all duration-200 text-white/80",
                  "hover:-translate-y-px hover:translate-x-1 hover:bg-white/15 hover:text-white",
                  active && "bg-white/20 font-extrabold text-white shadow-sm"
                )}
              >
                {active && <span aria-hidden className="absolute left-0 top-[7px] bottom-[7px] w-[3px] rounded-full bg-white/40" />}
                <span className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[14px] leading-none bg-white/12 transition-all duration-200",
                  "group-hover:bg-white/24 group-hover:scale-110",
                  active && "bg-white/20"
                )}>
                  {item.icon}
                </span>
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </div>

        {/* สื่อการสอน — ทุกคนเห็น */}
        <div className="mb-1 mt-4 flex items-center gap-1.5 px-1.5">
          <div className="h-px flex-1 bg-white/15" />
          <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-white/40">สื่อการสอน</span>
          <div className="h-px flex-1 bg-white/15" />
        </div>
        <div className="space-y-0.5">
          {RESOURCE_NAV.map((item) => {
            const active = currentPath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12px] font-bold transition-all duration-200 text-white/80",
                  "hover:-translate-y-px hover:translate-x-1 hover:bg-white/15 hover:text-white",
                  active && "bg-white/20 font-extrabold text-white shadow-sm"
                )}
              >
                {active && <span aria-hidden className="absolute left-0 top-[7px] bottom-[7px] w-[3px] rounded-full bg-white/40" />}
                <span className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[14px] leading-none bg-white/12 transition-all duration-200",
                  "group-hover:bg-white/24 group-hover:scale-110",
                  active && "bg-white/20"
                )}>
                  {item.icon}
                </span>
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </div>

        {/* Admin section — เฉพาะเมื่อ login แล้ว */}
        {isAdmin && (
          <>
            <div className="mb-1 mt-4 flex items-center gap-1.5 px-1.5">
              <div className="h-px flex-1 bg-amber-400/30" />
              <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-amber-300/70">🛡️ แอดมิน</span>
              <div className="h-px flex-1 bg-amber-400/30" />
            </div>
            <div className="space-y-0.5">
              {ADMIN_NAV.map((item) => {
                const active = currentPath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12px] font-bold transition-all duration-200 text-amber-200/80",
                      "hover:bg-amber-400/20 hover:text-amber-100",
                      active && "bg-amber-400/25 font-extrabold text-amber-100"
                    )}
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-400/20 text-[14px] leading-none transition-all group-hover:scale-110">
                      {item.icon}
                    </span>
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="shrink-0 px-3 pb-3 pt-1">
        <div className="flex items-center gap-2 rounded-xl bg-white/10 p-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-2xl">🐻</div>
          <div className="text-[10px] font-bold leading-snug text-white/80">
            เรียนเศษส่วนสนุกได้ทุกวัน!
          </div>
        </div>
      </div>
    </aside>
  );
}
