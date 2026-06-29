"use client";

import { useState, useEffect } from "react";
import { Settings, X, LogOut, Lock, BookOpen, Users, Info, ImagePlus, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { AdminContentManager } from "@/components/admin/AdminContentManager";

const ADMIN_KEY = "fa_admin_mode";
const ADMIN_PASSWORD = "obec2567";

export function AdminWidget() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showContentManager, setShowContentManager] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsAdmin(sessionStorage.getItem(ADMIN_KEY) === "1");
  }, []);

  function login() {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_KEY, "1");
      setIsAdmin(true);
      setShowModal(false);
      setShowPanel(true);
      setPassword("");
      setError("");
    } else {
      setError("รหัสผ่านไม่ถูกต้อง");
    }
  }

  function logout() {
    sessionStorage.removeItem(ADMIN_KEY);
    setIsAdmin(false);
    setShowPanel(false);
  }


function handleGearClick() {
    if (isAdmin) setShowPanel(true);
    else setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setPassword("");
    setError("");
  }

  return (
    <>
      {/* Floating gear button */}
      <button
        onClick={handleGearClick}
        title={isAdmin ? "แผงแอดมิน" : "เข้าสู่โหมดแอดมิน"}
        className={cn(
          "fixed bottom-20 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-all lg:bottom-6",
          isAdmin
            ? "bg-amber-400 text-amber-900 ring-2 ring-amber-300 hover:bg-amber-500"
            : "bg-white/80 text-slate-300 ring-1 ring-slate-200 backdrop-blur hover:bg-white hover:text-slate-500"
        )}
      >
        <Settings size={20} className={isAdmin ? "animate-none" : ""} />
      </button>

      {/* Admin mode badge */}
      {isAdmin && (
        <div className="fixed bottom-20 right-16 z-50 flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-amber-900 shadow-md lg:bottom-6">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-700" />
          โหมดแอดมิน
        </div>
      )}

      {/* Password modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={20} className="text-violet-600" />
                <h2 className="text-lg font-extrabold text-slate-800">โหมดแอดมิน</h2>
              </div>
              <button
                onClick={closeModal}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-3 text-sm font-medium text-slate-500">
              กรุณาใส่รหัสผ่านเพื่อเข้าจัดการหลังบ้าน
            </p>

            <div className="relative mt-4">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && login()}
                placeholder=""
                autoFocus
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-11 text-sm font-medium outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm font-bold text-rose-500">❌ {error}</p>
            )}

            <button
              onClick={login}
              className="mt-4 w-full rounded-xl bg-violet-600 py-2.5 text-sm font-extrabold text-white transition hover:bg-violet-700 active:scale-[0.98]"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </div>
      )}

      {/* Content Manager */}
      {showContentManager && isAdmin && (
        <AdminContentManager onClose={() => setShowContentManager(false)} />
      )}

      {/* Admin panel */}
      {showPanel && isAdmin && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowPanel(false)}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between bg-amber-400 px-5 py-4">
              <div className="flex items-center gap-2">
                <Settings size={20} className="text-amber-900" />
                <h2 className="text-lg font-extrabold text-amber-900">แผงแอดมิน</h2>
              </div>
              <button
                onClick={() => setShowPanel(false)}
                className="rounded-lg p-1 text-amber-800 hover:text-amber-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-3 p-5">

              {/* Site info */}
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 font-extrabold text-slate-700">
                  <Info size={15} />
                  ข้อมูลเว็บไซต์
                </div>
                <div className="space-y-1 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <BookOpen size={13} />
                    <span>บทเรียนทั้งหมด: 12 บท</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={13} />
                    <span>ระบบ: Open Access (ไม่ต้องสมัคร)</span>
                  </div>
                </div>
              </div>

              {/* Manage content */}
              <button
                onClick={() => { setShowPanel(false); setShowContentManager(true); }}
                className="flex w-full items-center gap-3 rounded-xl border-2 border-violet-100 bg-violet-50 px-4 py-3 text-left transition hover:border-violet-300 hover:bg-violet-100"
              >
                <ImagePlus size={18} className="shrink-0 text-violet-600" />
                <div>
                  <div className="text-sm font-extrabold text-violet-700">จัดการเนื้อหาบทเรียน</div>
                  <div className="text-xs text-violet-400">เพิ่ม / ซ่อน ภาพในแต่ละขั้น</div>
                </div>
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-left transition hover:border-slate-200 hover:bg-slate-100"
              >
                <LogOut size={18} className="shrink-0 text-slate-500" />
                <div className="text-sm font-extrabold text-slate-600">
                  ออกจากโหมดแอดมิน
                </div>
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
