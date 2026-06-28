"use client";

import { useState, useEffect, useRef } from "react";
import type { ReactNode, FormEvent } from "react";
import Link from "next/link";
import {
  Eye, EyeOff, Plus, Trash2, ChevronDown, ChevronRight,
  UserPlus, RefreshCw, ExternalLink, Download, Upload,
  Save, Check, Shield, ImagePlus
} from "lucide-react";
import { resizeImageToBase64 } from "@/lib/imageUtils";
import { cn } from "@/lib/cn";
import { getSystemSettings, saveSystemSettings } from "@/lib/systemSettings";
import { loadClassrooms, saveClassrooms } from "@/lib/classroomStore";
import { WS_STORAGE_KEY } from "@/lib/worksheetStore";
import { pageRoutes } from "@/data/pageRoutes";
import type { MockClassroom } from "@/lib/classroomStore";

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = "website" | "lessons" | "videos" | "worksheets" | "display" | "rewards" | "students" | "backup";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function genPin() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }
function genStudentId(existing: string[]) {
  for (let i = 1; i <= 999; i++) {
    const id = `S${String(i).padStart(3, "0")}`;
    if (!existing.includes(id)) return id;
  }
  return `S${Date.now()}`;
}
function extractYTId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

// ─── Static data ──────────────────────────────────────────────────────────────
const TABS: { id: TabId; emoji: string; label: string; active: string }[] = [
  { id: "website",    emoji: "🌐", label: "ข้อมูลเว็บไซต์",       active: "bg-sky-500 text-white" },
  { id: "lessons",    emoji: "📚", label: "จัดการบทเรียน",        active: "bg-violet-600 text-white" },
  { id: "videos",     emoji: "🎬", label: "วิดีโอบทเรียน",        active: "bg-red-500 text-white" },
  { id: "worksheets", emoji: "📋", label: "ใบงาน",                active: "bg-amber-500 text-white" },
  { id: "display",    emoji: "🎨", label: "การแสดงผล",            active: "bg-fuchsia-600 text-white" },
  { id: "rewards",    emoji: "🏆", label: "คะแนนและรางวัล",       active: "bg-yellow-500 text-white" },
  { id: "students",   emoji: "👥", label: "นักเรียนและห้องเรียน", active: "bg-emerald-600 text-white" },
  { id: "backup",     emoji: "💾", label: "สำรองข้อมูล",          active: "bg-slate-600 text-white" },
];

const LESSON_ROUTES = pageRoutes.filter(r => r.href.startsWith("/lessons/"));

const THEME_PRESETS = [
  { id: "violet", label: "ม่วง (ค่าเริ่มต้น)", p: "#7C3AED", s: "#FF6B9D" },
  { id: "blue",   label: "ฟ้าเข้ม",            p: "#2563EB", s: "#06B6D4" },
  { id: "green",  label: "เขียว",              p: "#059669", s: "#10B981" },
  { id: "orange", label: "ส้ม",                p: "#EA580C", s: "#F59E0B" },
];

// ─── Shared UI ────────────────────────────────────────────────────────────────
const LBL = "mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500";
const INP = "h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", on ? "bg-violet-600" : "bg-slate-200")}>
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", on ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{children}</div>;
}

function CardHead({ emoji, title, sub, extra }: { emoji: string; title: string; sub: string; extra?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm ring-1 ring-slate-200">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{sub}</p>
      </div>
      {extra}
    </div>
  );
}

function ToggleRow({ label, desc, on, onChange }: { label: string; desc?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-bold text-slate-700">{label}</p>
        {desc && <p className="text-xs text-slate-400">{desc}</p>}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

function SaveBar({ onSave, saved, color = "bg-violet-600 hover:bg-violet-700" }: { onSave: () => void; saved: boolean; color?: string }) {
  return (
    <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-5 py-3">
      <button onClick={onSave} className={cn("flex h-9 items-center gap-1.5 rounded-xl px-4 text-sm font-extrabold text-white transition", saved ? "bg-emerald-500" : color)}>
        {saved ? <><Check size={14} /> บันทึกแล้ว</> : <><Save size={14} /> บันทึกการตั้งค่า</>}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export function SettingsContent() {
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<TabId>("website");

  // ── 1. Website ──────────────────────────────────────────────────────────────
  const [webTitle, setWebTitle]       = useState("ผจญภัยดินแดนเศษส่วน");
  const [webDesc, setWebDesc]         = useState("เรียนรู้เศษส่วนอย่างสนุก เข้าใจง่าย สำหรับนักเรียนชั้นประถมศึกษาปีที่ 4-6");
  const [teacherName, setTeacherName] = useState("");
  const [schoolName, setSchoolName]   = useState("");
  const [webSaved, setWebSaved]       = useState(false);
  // security
  const [curPw, setCurPw]       = useState("");
  const [newPw, setNewPw]       = useState("");
  const [confPw, setConfPw]     = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [pwMsg, setPwMsg]       = useState<{ ok: boolean; text: string } | null>(null);

  // ── 2. Lessons ──────────────────────────────────────────────────────────────
  const [lessonOn, setLessonOn] = useState<Record<string, boolean>>({});
  const [lessonTipsImages, setLessonTipsImages] = useState<Record<string, string>>({});
  const [expandedLessonImg, setExpandedLessonImg] = useState<string>("");
  const [tipsImgUploading, setTipsImgUploading] = useState(false);
  const tipsImgInputRef = useRef<HTMLInputElement>(null);

  // ── 3. Videos ───────────────────────────────────────────────────────────────
  const [videoLinks, setVideoLinks]   = useState<Record<string, string>>({});
  const [vidLesson, setVidLesson]     = useState(LESSON_ROUTES[0]?.href ?? "");
  const [vidInput, setVidInput]       = useState("");
  const [vidSaved, setVidSaved]       = useState(false);

  // ── 5. Display ──────────────────────────────────────────────────────────────
  const [theme, setTheme]           = useState("violet");
  const [fontSize, setFontSize]     = useState<"small" | "medium" | "large">("medium");
  const [disp, setDisp]             = useState({ animation: true, sound: true, confetti: true, projector: false, fullscreen: false });
  const [dispSaved, setDispSaved]   = useState(false);

  // ── 6. Rewards ──────────────────────────────────────────────────────────────
  const [rewOn, setRewOn]           = useState({ xp: true, stars: true, coins: true });
  const [xpPer, setXpPer]           = useState(10);
  const [starPer, setStarPer]       = useState(1);
  const [coinPer, setCoinPer]       = useState(2);
  const [passScore, setPassScore]   = useState(80);
  const [praiseText, setPraiseText] = useState("เก่งมากเลย! 🎉");
  const [wrongText, setWrongText]   = useState("ลองอีกครั้งนะ 💪");
  const [rewSaved, setRewSaved]     = useState(false);

  // ── 7. Students / Classrooms ─────────────────────────────────────────────
  const [studMode, setStudMode]         = useState(true);
  const [reqName, setReqName]           = useState(false);
  const [classrooms, setClassrooms]     = useState<MockClassroom[]>([]);
  const [expanded, setExpanded]         = useState<string>("");
  const [addClsOpen, setAddClsOpen]     = useState(false);
  const [newPinVal, setNewPinVal]       = useState("");
  const [newTeacher, setNewTeacher]     = useState("");
  const [newClsName, setNewClsName]     = useState("");
  const [addStFor, setAddStFor]         = useState<string>("");
  const [newStName, setNewStName]       = useState("");
  const [newStGrade, setNewStGrade]     = useState("ป.5");

  // ── Load ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const sys = getSystemSettings();
    setSchoolName(sys.schoolName);
    try {
      const site = JSON.parse(localStorage.getItem("fa_site_settings") || "{}");
      if (site.webTitle)     setWebTitle(site.webTitle);
      if (site.webDesc)      setWebDesc(site.webDesc);
      if (site.teacherName)  setTeacherName(site.teacherName);

      const vids = JSON.parse(localStorage.getItem("fa_video_settings") || "{}");
      setVideoLinks(vids);
      if (LESSON_ROUTES[0]) setVidInput(vids[LESSON_ROUTES[0].href] ?? "");

      const les = JSON.parse(localStorage.getItem("fa_lesson_settings") || "{}");
      const map: Record<string, boolean> = {};
      LESSON_ROUTES.forEach(r => { map[r.href] = les[r.href] !== false; });
      setLessonOn(map);

      const tipsImgs = JSON.parse(localStorage.getItem("fa_lesson_tips_images") || "{}");
      setLessonTipsImages(tipsImgs);

      const dp = JSON.parse(localStorage.getItem("fa_display_settings") || "{}");
      if (dp.theme)    setTheme(dp.theme);
      if (dp.fontSize) setFontSize(dp.fontSize);
      if (dp.disp)     setDisp(prev => ({ ...prev, ...dp.disp }));

      const rw = JSON.parse(localStorage.getItem("fa_reward_settings") || "{}");
      if (rw.rewOn)      setRewOn(prev => ({ ...prev, ...rw.rewOn }));
      if (rw.xpPer != null)   setXpPer(rw.xpPer);
      if (rw.starPer != null) setStarPer(rw.starPer);
      if (rw.coinPer != null) setCoinPer(rw.coinPer);
      if (rw.passScore != null) setPassScore(rw.passScore);
      if (rw.praiseText) setPraiseText(rw.praiseText);
      if (rw.wrongText)  setWrongText(rw.wrongText);
    } catch {}

    setClassrooms(loadClassrooms());
    setLoaded(true);
  }, []);

  useEffect(() => { if (loaded) saveClassrooms(classrooms); }, [classrooms, loaded]);

  // ── Save helpers ─────────────────────────────────────────────────────────
  function saveWeb() {
    localStorage.setItem("fa_site_settings", JSON.stringify({ webTitle, webDesc, teacherName }));
    saveSystemSettings({ schoolName });
    setWebSaved(true); setTimeout(() => setWebSaved(false), 2000);
  }

  function saveVideoLink() {
    const next = { ...videoLinks, [vidLesson]: vidInput };
    setVideoLinks(next);
    localStorage.setItem("fa_video_settings", JSON.stringify(next));
    setVidSaved(true); setTimeout(() => setVidSaved(false), 2000);
  }

  function saveDisp() {
    localStorage.setItem("fa_display_settings", JSON.stringify({ theme, fontSize, disp }));
    setDispSaved(true); setTimeout(() => setDispSaved(false), 2000);
  }

  function saveRew() {
    localStorage.setItem("fa_reward_settings", JSON.stringify({ rewOn, xpPer, starPer, coinPer, passScore, praiseText, wrongText }));
    setRewSaved(true); setTimeout(() => setRewSaved(false), 2000);
  }

  function handleChangePw(e: FormEvent) {
    e.preventDefault();
    const { adminPassword } = getSystemSettings();
    if (curPw !== adminPassword) { setPwMsg({ ok: false, text: "รหัสผ่านปัจจุบันไม่ถูกต้อง" }); return; }
    if (newPw.length < 6) { setPwMsg({ ok: false, text: "รหัสใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" }); return; }
    if (newPw !== confPw) { setPwMsg({ ok: false, text: "รหัสยืนยันไม่ตรงกัน" }); return; }
    saveSystemSettings({ adminPassword: newPw });
    setCurPw(""); setNewPw(""); setConfPw("");
    setPwMsg({ ok: true, text: "✅ เปลี่ยนรหัสผ่านสำเร็จ" });
    setTimeout(() => setPwMsg(null), 3000);
  }

  // ── Lesson tips image ────────────────────────────────────────────────────
  async function handleTipsImageUpload(e: React.ChangeEvent<HTMLInputElement>, slug: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    setTipsImgUploading(true);
    try {
      const b64 = await resizeImageToBase64(file, 800);
      const next = { ...lessonTipsImages, [slug]: b64 };
      setLessonTipsImages(next);
      localStorage.setItem("fa_lesson_tips_images", JSON.stringify(next));
    } finally {
      setTipsImgUploading(false);
      if (tipsImgInputRef.current) tipsImgInputRef.current.value = "";
    }
  }

  function deleteTipsImage(slug: string) {
    const next = { ...lessonTipsImages };
    delete next[slug];
    setLessonTipsImages(next);
    localStorage.setItem("fa_lesson_tips_images", JSON.stringify(next));
  }

  // ── Classroom CRUD ───────────────────────────────────────────────────────
  function handleAddCls(e: FormEvent) {
    e.preventDefault();
    if (!newPinVal.trim() || !newTeacher.trim() || !newClsName.trim()) return;
    if (classrooms.some(c => c.teacherPin.toUpperCase() === newPinVal.trim().toUpperCase())) return;
    const nc: MockClassroom = { teacherPin: newPinVal.trim().toUpperCase(), teacherName: newTeacher.trim(), className: newClsName.trim(), students: [] };
    setClassrooms(prev => [...prev, nc]);
    setNewPinVal(""); setNewTeacher(""); setNewClsName(""); setAddClsOpen(false);
    setExpanded(nc.teacherPin);
  }

  function delCls(pin: string) {
    if (!confirm(`ลบห้องเรียน PIN: ${pin}?`)) return;
    setClassrooms(prev => prev.filter(c => c.teacherPin !== pin));
    if (expanded === pin) setExpanded("");
  }

  function addStudent(pin: string) {
    if (!newStName.trim()) return;
    setClassrooms(prev => prev.map(c => {
      if (c.teacherPin !== pin) return c;
      const id = genStudentId(c.students.map(s => s.id));
      return { ...c, students: [...c.students, { id, name: newStName.trim(), grade: newStGrade }] };
    }));
    setNewStName(""); setAddStFor("");
  }

  function delStudent(pin: string, sid: string) {
    setClassrooms(prev => prev.map(c => c.teacherPin !== pin ? c : { ...c, students: c.students.filter(s => s.id !== sid) }));
  }

  // ── Data resets ──────────────────────────────────────────────────────────
  function resetWS()   { if (!confirm("ล้างใบงานทั้งหมด?")) return; localStorage.removeItem(WS_STORAGE_KEY); location.reload(); }
  function resetMed()  { if (!confirm("ล้างคลังสื่อทั้งหมด?")) return; localStorage.removeItem("fa-media-library"); location.reload(); }
  function resetCls()  { if (!confirm("รีเซ็ตห้องเรียนเป็นค่าเริ่มต้น?")) return; localStorage.removeItem("fa_classrooms"); location.reload(); }
  function clearAll()  {
    if (!confirm("⚠️ ล้างข้อมูลทั้งหมดในระบบ? ไม่สามารถย้อนกลับได้")) return;
    ["fa_worksheets","fa-media-library","fa_classrooms","fa_student_session","fa_system_settings","sidebar_role",
     "fa_site_settings","fa_video_settings","fa_lesson_settings","fa_display_settings","fa_reward_settings"]
      .forEach(k => localStorage.removeItem(k));
    location.reload();
  }
  function exportSettings() {
    const keys = ["fa_site_settings","fa_system_settings","fa_lesson_settings","fa_video_settings","fa_display_settings","fa_reward_settings"];
    const data: Record<string, unknown> = {};
    keys.forEach(k => { try { data[k] = JSON.parse(localStorage.getItem(k) || "null"); } catch {} });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "settings-backup.json" });
    a.click();
  }

  if (!loaded) return <div className="py-16 text-center text-sm text-slate-400">กำลังโหลด...</div>;

  const ytId = extractYTId(vidInput);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Tab bar */}
      <div className="mb-5 flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-extrabold transition",
              tab === t.id ? t.active : "text-slate-600 hover:bg-slate-100")}>
            <span>{t.emoji}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── 1. ข้อมูลเว็บไซต์ ─────────────────────────────────────────────── */}
      {tab === "website" && (
        <div className="space-y-4">
          <Card>
            <CardHead emoji="🌐" title="ข้อมูลเว็บไซต์" sub="ชื่อ คำอธิบาย ครู โรงเรียน และธีมสี" />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <label className={LBL}>ชื่อเว็บไซต์</label>
                <input value={webTitle} onChange={e => setWebTitle(e.target.value)} className={INP} />
              </div>
              <div>
                <label className={LBL}>ชื่อครู / ผู้ดูแลระบบ</label>
                <input value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder="ครูสมศรี ใจดี" className={INP} />
              </div>
              <div>
                <label className={LBL}>ชื่อโรงเรียน</label>
                <input value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="โรงเรียนบ้านตัวอย่าง" className={INP} />
              </div>
              <div className="sm:col-span-2">
                <label className={LBL}>คำอธิบายเว็บไซต์</label>
                <textarea value={webDesc} onChange={e => setWebDesc(e.target.value)} rows={2}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white" />
              </div>
            </div>

            {/* Logo & Banner */}
            <div className="grid gap-4 border-t border-slate-100 px-5 py-4 sm:grid-cols-2">
              <div>
                <label className={LBL}>โลโก้เว็บไซต์</label>
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-2xl">🍕</div>
                  <button className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-extrabold text-slate-600 hover:bg-slate-50">
                    <Upload size={13} /> เปลี่ยนโลโก้
                  </button>
                  <span className="text-[10px] text-slate-400">แนะนำขนาด 512×512 px</span>
                </div>
              </div>
              <div>
                <label className={LBL}>แบนเนอร์หน้าแรก</label>
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-400 to-pink-400 text-xs font-bold text-white">Banner</div>
                  <button className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-extrabold text-slate-600 hover:bg-slate-50">
                    <Upload size={13} /> เปลี่ยนแบนเนอร์
                  </button>
                  <span className="text-[10px] text-slate-400">แนะนำขนาด 1200×400 px</span>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="flex flex-wrap gap-6 border-t border-slate-100 px-5 py-4">
              {[{ label: "สีหลัก", def: "#7C3AED" }, { label: "สีรอง", def: "#FF6B9D" }].map(c => (
                <div key={c.label}>
                  <label className={LBL}>{c.label}</label>
                  <div className="flex items-center gap-2">
                    <input type="color" defaultValue={c.def}
                      className="h-8 w-10 cursor-pointer rounded-lg border border-slate-200 p-0.5" />
                    <code className="rounded bg-slate-100 px-2 py-1 text-xs font-mono font-bold text-slate-700">{c.def}</code>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3">
              <button className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50">
                <ExternalLink size={13} /> ดูตัวอย่างเว็บไซต์
              </button>
              <SaveBar onSave={saveWeb} saved={webSaved} />
            </div>
          </Card>

          <Card>
            <CardHead emoji="🔐" title="ความปลอดภัย" sub="เปลี่ยนรหัสผ่านสำหรับเข้าโหมดแอดมิน" />
            <form onSubmit={handleChangePw} className="space-y-3 p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                {[{ label: "รหัสผ่านปัจจุบัน", val: curPw, set: setCurPw }, { label: "รหัสผ่านใหม่", val: newPw, set: setNewPw }, { label: "ยืนยันรหัสผ่านใหม่", val: confPw, set: setConfPw }].map(({ label, val, set }) => (
                  <div key={label}>
                    <label className={LBL}>{label}</label>
                    <div className="relative">
                      <input type={showPw ? "text" : "password"} value={val} onChange={e => set(e.target.value)} className={cn(INP, "pr-9")} />
                      <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {pwMsg && <p className={cn("rounded-xl px-3 py-2 text-xs font-bold", pwMsg.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>{pwMsg.text}</p>}
              <div className="flex items-center gap-3">
                <button type="submit" disabled={!curPw || !newPw || !confPw}
                  className="flex h-9 items-center gap-1.5 rounded-xl bg-rose-500 px-4 text-sm font-extrabold text-white transition hover:bg-rose-600 disabled:opacity-50">
                  <Shield size={14} /> เปลี่ยนรหัสผ่าน
                </button>
                <p className="text-[11px] text-slate-400">รหัสผ่านเริ่มต้น: <code className="rounded bg-slate-100 px-1 font-mono">admin1234</code></p>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── 2. จัดการบทเรียน ─────────────────────────────────────────────── */}
      {tab === "lessons" && (
        <div className="space-y-4">
          <input
            ref={tipsImgInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleTipsImageUpload(e, expandedLessonImg)}
          />
          <Card>
            <CardHead emoji="📚" title="จัดการบทเรียน" sub="เปิด/ปิดบทเรียน และอัปโหลดภาพ จำง่าย ๆ" />
            <div className="divide-y divide-slate-100 p-3">
              {LESSON_ROUTES.map(r => {
                const slug = r.href.replace("/lessons/", "");
                const hasImg = !!lessonTipsImages[slug];
                const isOpen = expandedLessonImg === slug;
                return (
                  <div key={r.href} className="rounded-xl">
                    {/* Row */}
                    <div className="flex items-center gap-3 px-3 py-3">
                      <span className="text-xl">{r.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-extrabold text-slate-800">{r.title}</p>
                          {hasImg && <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-extrabold text-violet-700">มีภาพ</span>}
                        </div>
                        <p className="truncate text-xs text-slate-400">{r.eyebrow} · {r.description}</p>
                      </div>
                      <button
                        type="button"
                        title="จัดการภาพจำง่าย ๆ"
                        onClick={() => setExpandedLessonImg(isOpen ? "" : slug)}
                        className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition",
                          isOpen ? "bg-violet-100 text-violet-600" : "text-slate-400 hover:bg-slate-100")}
                      >
                        <ImagePlus size={15} />
                      </button>
                      <Toggle
                        on={lessonOn[r.href] !== false}
                        onChange={v => {
                          const next = { ...lessonOn, [r.href]: v };
                          setLessonOn(next);
                          localStorage.setItem("fa_lesson_settings", JSON.stringify(next));
                        }}
                      />
                    </div>
                    {/* Expandable image area */}
                    {isOpen && (
                      <div className="mx-3 mb-3 overflow-hidden rounded-xl border border-violet-100 bg-violet-50/50">
                        <div className="border-b border-violet-100 px-4 py-2.5">
                          <p className="text-xs font-extrabold text-violet-700">📷 ภาพ "จำง่าย ๆ" สำหรับ {r.title}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500">อัปโหลดภาพสรุป เช่น อินโฟกราฟิก หรือสูตรจำ — แทนที่การ์ดจำง่ายอัตโนมัติ</p>
                        </div>
                        <div className="p-4">
                          {hasImg ? (
                            <div className="flex gap-3">
                              <img src={lessonTipsImages[slug]} alt="ภาพสรุป"
                                className="h-24 w-auto rounded-xl border border-slate-200 object-cover shadow-sm" />
                              <div className="flex flex-col justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => { setExpandedLessonImg(slug); tipsImgInputRef.current?.click(); }}
                                  className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-violet-700"
                                >
                                  <Upload size={12} /> เปลี่ยนภาพ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteTipsImage(slug)}
                                  className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-xs font-extrabold text-rose-600 transition hover:bg-rose-100"
                                >
                                  <Trash2 size={12} /> ลบภาพ (ใช้เนื้อหาอัตโนมัติ)
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={tipsImgUploading}
                              onClick={() => { setExpandedLessonImg(slug); tipsImgInputRef.current?.click(); }}
                              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-200 bg-white py-5 text-sm font-extrabold text-violet-400 transition hover:border-violet-400 hover:text-violet-600 disabled:opacity-50"
                            >
                              <ImagePlus size={16} />
                              {tipsImgUploading ? "กำลังประมวลผล..." : "อัปโหลดภาพจำง่าย ๆ (PNG / JPG)"}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ── 3. วิดีโอบทเรียน ─────────────────────────────────────────────── */}
      {tab === "videos" && (
        <div className="space-y-4">
          <Card>
            <CardHead emoji="🎬" title="เพิ่ม / แก้ไขลิงก์วิดีโอ" sub="ใส่ลิงก์ YouTube ให้แต่ละบทเรียน" />
            <div className="space-y-4 p-5">
              <div>
                <label className={LBL}>เลือกบทเรียน</label>
                <select value={vidLesson} onChange={e => { setVidLesson(e.target.value); setVidInput(videoLinks[e.target.value] ?? ""); setVidSaved(false); }} className={INP}>
                  {LESSON_ROUTES.map(r => <option key={r.href} value={r.href}>{r.icon} {r.title}</option>)}
                </select>
              </div>
              <div>
                <label className={LBL}>ลิงก์ YouTube</label>
                <input value={vidInput} onChange={e => { setVidInput(e.target.value); setVidSaved(false); }}
                  placeholder="https://youtu.be/... หรือ https://www.youtube.com/watch?v=..."
                  className={INP} />
              </div>

              {ytId && (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="thumbnail" className="w-full" />
                  <div className="flex items-center justify-between bg-slate-50 px-3 py-2">
                    <span className="text-xs font-bold text-slate-600">🎬 ตัวอย่างวิดีโอ</span>
                    <a href={vidInput} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-extrabold text-violet-600 hover:underline">
                      <ExternalLink size={11} /> เปิดดู
                    </a>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={saveVideoLink}
                  className={cn("flex h-9 items-center gap-1.5 rounded-xl px-4 text-sm font-extrabold text-white transition", vidSaved ? "bg-emerald-500" : "bg-violet-600 hover:bg-violet-700")}>
                  {vidSaved ? <><Check size={14} /> บันทึกแล้ว</> : <><Save size={14} /> บันทึกวิดีโอ</>}
                </button>
                {videoLinks[vidLesson] && (
                  <button onClick={() => { const n = { ...videoLinks }; delete n[vidLesson]; setVideoLinks(n); setVidInput(""); localStorage.setItem("fa_video_settings", JSON.stringify(n)); }}
                    className="flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 px-3 text-sm font-bold text-rose-500 hover:bg-rose-50">
                    <Trash2 size={13} /> ลบวิดีโอ
                  </button>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <CardHead emoji="📊" title="สถานะวิดีโอทุกบทเรียน" sub="คลิกบทเรียนเพื่อแก้ไขลิงก์" />
            <div className="divide-y divide-slate-50 p-3">
              {LESSON_ROUTES.map(r => (
                <button key={r.href} onClick={() => { setVidLesson(r.href); setVidInput(videoLinks[r.href] ?? ""); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50">
                  <span className="text-lg">{r.icon}</span>
                  <p className="flex-1 text-sm font-bold text-slate-700">{r.title}</p>
                  <span className={cn("rounded-lg px-2.5 py-1 text-[10px] font-extrabold",
                    videoLinks[r.href] ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400")}>
                    {videoLinks[r.href] ? "🎬 มีวิดีโอ" : "ยังไม่มี"}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── 4. ใบงาน ─────────────────────────────────────────────────────── */}
      {tab === "worksheets" && (
        <Card>
          <CardHead emoji="📋" title="จัดการใบงาน" sub="เพิ่ม แก้ไข เผยแพร่ใบงานสำหรับแต่ละบทเรียน" />
          <div className="p-5">
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="mb-1 text-sm font-extrabold text-amber-800">ใช้หน้าจัดการใบงานแบบเต็ม</p>
              <p className="mb-3 text-xs text-amber-600">หน้าจัดการใบงานมีฟีเจอร์ครบ: เพิ่ม แก้ไข จัดลำดับ เผยแพร่/ซ่อน ค้นหา กรองตามบทเรียน</p>
              <Link href="/admin/worksheets"
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-extrabold text-white hover:bg-amber-600">
                <ExternalLink size={13} /> ไปที่หน้าจัดการใบงาน
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "ใบงานทั้งหมด", value: "–", cls: "bg-slate-100 text-slate-700" },
                { label: "เผยแพร่แล้ว",  value: "–", cls: "bg-emerald-100 text-emerald-700" },
                { label: "ซ่อนอยู่",      value: "–", cls: "bg-rose-100 text-rose-700" },
              ].map(s => (
                <div key={s.label} className={cn("rounded-xl p-3 text-center", s.cls)}>
                  <p className="text-2xl font-extrabold">{s.value}</p>
                  <p className="text-[11px] font-bold">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── 5. การแสดงผล ─────────────────────────────────────────────────── */}
      {tab === "display" && (
        <Card>
          <CardHead emoji="🎨" title="การแสดงผล" sub="ธีมสี ขนาดตัวอักษร และเอฟเฟกต์พิเศษ" />
          <div className="space-y-6 p-5">
            <div>
              <label className={LBL}>ธีมสี</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {THEME_PRESETS.map(t => (
                  <button key={t.id} onClick={() => setTheme(t.id)}
                    className={cn("flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-xs font-extrabold transition",
                      theme === t.id ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:border-slate-300")}>
                    <div className="flex gap-1">
                      <div className="h-5 w-5 rounded-full" style={{ background: t.p }} />
                      <div className="h-5 w-5 rounded-full" style={{ background: t.s }} />
                    </div>
                    <span className="text-slate-700">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={LBL}>ขนาดตัวอักษร</label>
              <div className="flex gap-2">
                {(["small","medium","large"] as const).map(sz => (
                  <button key={sz} onClick={() => setFontSize(sz)}
                    className={cn("flex-1 rounded-xl border-2 py-2 font-extrabold transition",
                      fontSize === sz ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600 hover:border-slate-300")}
                    style={{ fontSize: sz === "small" ? 12 : sz === "medium" ? 14 : 16 }}>
                    {sz === "small" ? "เล็ก" : sz === "medium" ? "ปกติ" : "ใหญ่"}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-4">
              {([
                { key: "animation" as const, label: "แอนิเมชัน",           desc: "เอฟเฟกต์เคลื่อนไหวบนหน้าเรียน" },
                { key: "sound"     as const, label: "เสียงเอฟเฟกต์",       desc: "เสียงตอบถูก/ผิด" },
                { key: "confetti"  as const, label: "เอฟเฟกต์ Confetti",   desc: "กระดาษสีปลิวเมื่อตอบถูก" },
                { key: "projector" as const, label: "โหมดโปรเจคเตอร์",     desc: "ขยายข้อความ เหมาะฉายหน้าชั้น" },
                { key: "fullscreen" as const, label: "เปิดแบบเต็มจอ",      desc: "บทเรียนเปิดในโหมดเต็มจอ" },
              ] as const).map(({ key, label, desc }) => (
                <ToggleRow key={key} label={label} desc={desc}
                  on={disp[key]} onChange={v => setDisp(prev => ({ ...prev, [key]: v }))} />
              ))}
            </div>
          </div>
          <SaveBar onSave={saveDisp} saved={dispSaved} color="bg-fuchsia-600 hover:bg-fuchsia-700" />
        </Card>
      )}

      {/* ── 6. คะแนนและรางวัล ────────────────────────────────────────────── */}
      {tab === "rewards" && (
        <div className="space-y-4">
          <Card>
            <CardHead emoji="🏆" title="ระบบรางวัล" sub="เปิด/ปิดสิ่งที่นักเรียนสะสมได้" />
            <div className="divide-y divide-slate-100 px-5">
              <ToggleRow label="คะแนนประสบการณ์ (XP)" desc="แสดง XP Bar บนโปรไฟล์" on={rewOn.xp} onChange={v => setRewOn(p => ({ ...p, xp: v }))} />
              <ToggleRow label="ดาว ⭐" desc="รับดาวเมื่อทำกิจกรรมสำเร็จ" on={rewOn.stars} onChange={v => setRewOn(p => ({ ...p, stars: v }))} />
              <ToggleRow label="เหรียญ 🪙" desc="ใช้แลกไอเทมในร้านค้า (อนาคต)" on={rewOn.coins} onChange={v => setRewOn(p => ({ ...p, coins: v }))} />
            </div>
          </Card>

          <Card>
            <CardHead emoji="⚙️" title="ค่ารางวัลต่อกิจกรรม" sub="รางวัลที่ได้รับต่อการทำแบบฝึกหัด 1 ครั้ง" />
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              {[
                { label: "XP ต่อกิจกรรม", val: xpPer, set: setXpPer, unit: "XP" },
                { label: "ดาวต่อกิจกรรม", val: starPer, set: setStarPer, unit: "ดาว" },
                { label: "เหรียญต่อกิจกรรม", val: coinPer, set: setCoinPer, unit: "เหรียญ" },
              ].map(({ label, val, set, unit }) => (
                <div key={label}>
                  <label className={LBL}>{label}</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min={0} max={100} value={val} onChange={e => set(Number(e.target.value))} className={cn(INP, "text-center")} />
                    <span className="shrink-0 text-sm font-extrabold text-slate-500">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 p-5">
              <label className={LBL}>คะแนนผ่านเกณฑ์</label>
              <div className="flex items-center gap-2">
                <input type="number" min={0} max={100} value={passScore} onChange={e => setPassScore(Number(e.target.value))} className={cn(INP, "w-24 text-center")} />
                <span className="text-sm font-extrabold text-slate-500">/ 100</span>
                <span className={cn("rounded-lg px-2 py-1 text-xs font-extrabold", passScore >= 70 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                  {passScore >= 70 ? "✅ มาตรฐาน" : "⚠️ ต่ำ"}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHead emoji="💬" title="ข้อความตอบกลับ" sub="ข้อความที่นักเรียนเห็นเมื่อตอบถูกหรือผิด" />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <label className={LBL}>ข้อความชมเชย (ตอบถูก) ✅</label>
                <input value={praiseText} onChange={e => setPraiseText(e.target.value)} className={INP} />
              </div>
              <div>
                <label className={LBL}>ข้อความเมื่อตอบผิด ❌</label>
                <input value={wrongText} onChange={e => setWrongText(e.target.value)} className={INP} />
              </div>
            </div>
            <SaveBar onSave={saveRew} saved={rewSaved} color="bg-yellow-500 hover:bg-yellow-600" />
          </Card>
        </div>
      )}

      {/* ── 7. นักเรียนและห้องเรียน ──────────────────────────────────────── */}
      {tab === "students" && (
        <div className="space-y-4">
          <Card>
            <CardHead emoji="⚙️" title="ตัวเลือกโหมดนักเรียน" sub="ตั้งค่าว่านักเรียนต้องทำอะไรก่อนเข้าเรียน" />
            <div className="divide-y divide-slate-100 px-5">
              <ToggleRow label="เปิดโหมดนักเรียน" desc="ถ้าปิด ทุกคนจะเข้าแบบ Guest เท่านั้น" on={studMode} onChange={setStudMode} />
              <ToggleRow label="ให้นักเรียนกรอกชื่อก่อนเรียน" desc="Guest ต้องกรอกชื่อเล่นก่อนเริ่มบทเรียน" on={reqName} onChange={setReqName} />
            </div>
          </Card>

          <Card>
            <CardHead emoji="🏫" title="จัดการห้องเรียน" sub="Teacher PIN และรายชื่อนักเรียนในแต่ละห้อง"
              extra={
                <button onClick={() => setAddClsOpen(v => !v)}
                  className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-violet-700">
                  <Plus size={13} /> เพิ่มห้องเรียน
                </button>
              }
            />
            <div className="space-y-2 p-4">
              {addClsOpen && (
                <form onSubmit={handleAddCls} className="mb-2 space-y-3 rounded-xl border border-violet-200 bg-violet-50/60 p-4">
                  <p className="text-xs font-extrabold text-violet-700">➕ ห้องเรียนใหม่</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className={LBL}>Teacher PIN</label>
                      <div className="flex gap-1.5">
                        <input value={newPinVal} onChange={e => setNewPinVal(e.target.value.toUpperCase())} placeholder="เช่น MATH01" maxLength={10} className={INP} />
                        <button type="button" onClick={() => setNewPinVal(genPin())} className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
                          <RefreshCw size={14} className="mx-auto" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={LBL}>ชื่อครู</label>
                      <input value={newTeacher} onChange={e => setNewTeacher(e.target.value)} placeholder="ครูสมศรี" className={INP} />
                    </div>
                    <div>
                      <label className={LBL}>ชื่อห้อง/ชั้น</label>
                      <input value={newClsName} onChange={e => setNewClsName(e.target.value)} placeholder="ป.5/1" className={INP} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setAddClsOpen(false)} className="flex h-9 items-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50">ยกเลิก</button>
                    <button type="submit" disabled={!newPinVal.trim() || !newTeacher.trim() || !newClsName.trim()}
                      className="flex h-9 items-center rounded-xl bg-violet-600 px-5 text-xs font-extrabold text-white hover:bg-violet-700 disabled:opacity-50">สร้างห้องเรียน</button>
                  </div>
                </form>
              )}

              {classrooms.length === 0 && <p className="py-8 text-center text-sm text-slate-400">ยังไม่มีห้องเรียน</p>}

              {classrooms.map(cls => {
                const isOpen = expanded === cls.teacherPin;
                return (
                  <div key={cls.teacherPin} className="overflow-hidden rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3">
                      <button onClick={() => setExpanded(isOpen ? "" : cls.teacherPin)} className="flex flex-1 items-center gap-2.5 text-left">
                        {isOpen ? <ChevronDown size={15} className="text-slate-400" /> : <ChevronRight size={15} className="text-slate-400" />}
                        <div>
                          <p className="text-sm font-extrabold text-slate-800">{cls.className} — {cls.teacherName}</p>
                          <p className="text-[11px] text-slate-500">PIN: <code className="rounded bg-white px-1.5 py-0.5 font-mono font-bold text-violet-700">{cls.teacherPin}</code> · {cls.students.length} คน</p>
                        </div>
                      </button>
                      <button onClick={() => delCls(cls.teacherPin)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {isOpen && (
                      <div className="space-y-2 p-4">
                        {cls.students.length === 0 && <p className="text-xs text-slate-400">ยังไม่มีนักเรียนในห้องนี้</p>}
                        {cls.students.map(st => (
                          <div key={st.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2">
                            <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-50 text-sm">👦</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-extrabold text-slate-800">{st.name}</p>
                              <p className="text-[10px] text-slate-400">ID: <code className="font-mono">{st.id}</code> · {st.grade}</p>
                            </div>
                            <button onClick={() => delStudent(cls.teacherPin, st.id)} className="rounded-lg p-1 text-slate-300 hover:text-rose-500">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                        {addStFor === cls.teacherPin ? (
                          <div className="flex gap-2 pt-1">
                            <input value={newStName} onChange={e => setNewStName(e.target.value)} placeholder="ชื่อนักเรียน"
                              className="h-9 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold outline-none focus:border-violet-400" />
                            <select value={newStGrade} onChange={e => setNewStGrade(e.target.value)}
                              className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-xs font-bold outline-none">
                              {["ป.4","ป.5","ป.6"].map(g => <option key={g}>{g}</option>)}
                            </select>
                            <button onClick={() => addStudent(cls.teacherPin)} disabled={!newStName.trim()}
                              className="h-9 rounded-xl bg-violet-600 px-3 text-xs font-extrabold text-white disabled:opacity-50">เพิ่ม</button>
                            <button onClick={() => { setAddStFor(""); setNewStName(""); }}
                              className="h-9 rounded-xl border border-slate-200 px-2 text-xs text-slate-500 hover:bg-slate-50">ยกเลิก</button>
                          </div>
                        ) : (
                          <button onClick={() => setAddStFor(cls.teacherPin)}
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-violet-300 px-3 py-2 text-xs font-bold text-violet-600 hover:bg-violet-50">
                            <UserPlus size={13} /> เพิ่มนักเรียน
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ── 8. สำรองข้อมูล ───────────────────────────────────────────────── */}
      {tab === "backup" && (
        <div className="space-y-4">
          <Card>
            <CardHead emoji="💾" title="ส่งออก / นำเข้าข้อมูล" sub="สำรองการตั้งค่าทั้งหมดเป็นไฟล์ JSON" />
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              <button onClick={exportSettings}
                className="flex h-14 items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-left text-sm font-extrabold text-emerald-700 transition hover:bg-emerald-100">
                <Download size={18} className="shrink-0" />
                <div>
                  <p>ส่งออกการตั้งค่า</p>
                  <p className="text-xs font-normal text-emerald-500">ดาวน์โหลด settings-backup.json</p>
                </div>
              </button>
              <button className="flex h-14 cursor-not-allowed items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 text-left text-sm font-extrabold text-slate-400">
                <Upload size={18} className="shrink-0" />
                <div>
                  <p>นำเข้าการตั้งค่า</p>
                  <p className="text-xs font-normal text-slate-400">เร็ว ๆ นี้</p>
                </div>
              </button>
            </div>
          </Card>

          <Card>
            <CardHead emoji="🔄" title="รีเซ็ตข้อมูลแต่ละส่วน" sub="โหลดข้อมูลตัวอย่างเริ่มต้นกลับมา" />
            <div className="space-y-2 p-4">
              {[
                { label: "รีเซ็ตใบงาน",     desc: "โหลดใบงานตัวอย่างเริ่มต้นกลับมา",        icon: "📋", fn: resetWS },
                { label: "รีเซ็ตคลังสื่อ",  desc: "โหลดสื่อตัวอย่างเริ่มต้นกลับมา",        icon: "🗂️", fn: resetMed },
                { label: "รีเซ็ตห้องเรียน", desc: "โหลดห้องเรียน TEACH01/TEACH02 กลับมา", icon: "🏫", fn: resetCls },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="text-sm font-extrabold text-slate-700">{item.label}</p>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                  <button onClick={item.fn} className="rounded-xl border border-amber-200 px-3 py-1.5 text-xs font-extrabold text-amber-700 transition hover:bg-amber-50">
                    รีเซ็ต
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHead emoji="⚠️" title="Danger Zone" sub="การกระทำเหล่านี้ไม่สามารถย้อนกลับได้" />
            <div className="p-5">
              <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-extrabold text-rose-700">ล้างข้อมูลทั้งหมดในระบบ</p>
                    <p className="text-xs text-rose-500">ใบงาน + คลังสื่อ + ห้องเรียน + session + การตั้งค่า ทั้งหมดจะหายไป</p>
                  </div>
                  <button onClick={clearAll} className="shrink-0 rounded-xl border border-rose-300 bg-white px-3 py-2 text-xs font-extrabold text-rose-600 transition hover:bg-rose-500 hover:text-white">
                    ล้างทั้งหมด
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHead emoji="ℹ️" title="เกี่ยวกับระบบ" sub="เวอร์ชันและเทคโนโลยีที่ใช้" />
            <div className="grid gap-2 p-5 sm:grid-cols-2">
              {[
                { label: "ชื่อโปรเจค",  value: "ผจญภัยดินแดนเศษส่วน" },
                { label: "เวอร์ชัน",    value: "1.0.0" },
                { label: "Framework",  value: "Next.js 14 App Router" },
                { label: "UI Library", value: "Tailwind CSS" },
                { label: "ภาษา",       value: "TypeScript" },
                { label: "ข้อมูล",     value: "localStorage (Supabase-ready)" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                  <span className="text-xs font-bold text-slate-500">{label}</span>
                  <span className="text-xs font-extrabold text-slate-700">{value}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 px-5 py-3 text-center text-[11px] text-slate-400">
              สร้างเพื่อการศึกษา · ป.4–ป.6 · ภาษาไทย 🇹🇭
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
