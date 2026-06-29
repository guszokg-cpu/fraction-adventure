"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { MediaHeader } from "@/components/media-library/MediaHeader";
import { MediaFilters } from "@/components/media-library/MediaFilters";
import { MediaGrid } from "@/components/media-library/MediaGrid";
import { AddMediaModal } from "@/components/media-library/AddMediaModal";
import { gradeMatches, initialMedia, type MediaItem, type MediaType } from "@/components/media-library/data";

const STORAGE_KEY = "fa-media-library";
type SortValue = "latest" | "popular" | "az";

const ADMIN_KEY = "fa_admin_mode";

export function MediaLibraryClient() {
  const [items, setItems] = useState<MediaItem[]>(initialMedia);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<MediaType | "all">("all");
  const [grade, setGrade] = useState("ทั้งหมด");
  const [category, setCategory] = useState("ทั้งหมด");
  const [sort, setSort] = useState<SortValue>("latest");
  const [pageSize, setPageSize] = useState(8);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const check = () => setIsAdmin(sessionStorage.getItem(ADMIN_KEY) === "1");
    check();
    window.addEventListener("storage", check);
    const id = setInterval(check, 1000);
    return () => { window.removeEventListener("storage", check); clearInterval(id); };
  }, []);

  // โหลดจาก localStorage หลัง mount (เลี่ยง hydration mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MediaItem[];
        if (Array.isArray(parsed) && parsed.length > 0) setItems(parsed);
      }
    } catch {
      /* ข้ามถ้าอ่านไม่ได้ */
    }
    setLoaded(true);
  }, []);

  // บันทึกเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* localStorage อาจเต็ม — ข้ามได้ */
    }
  }, [items, loaded]);

  // รีเซ็ตหน้าเมื่อเปลี่ยนตัวกรอง
  useEffect(() => {
    setPage(1);
  }, [search, type, grade, category, sort, pageSize]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = items.filter((item) => {
      if (type !== "all" && item.type !== type) return false;
      if (!gradeMatches(item.grade, grade)) return false;
      if (category !== "ทั้งหมด" && item.category !== category) return false;
      if (q) {
        const haystack = `${item.title} ${item.description} ${item.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title, "th");
      if (sort === "popular") return b.uses - a.uses;
      return b.createdAt - a.createdAt;
    });
    return result;
  }, [items, search, type, grade, category, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);
  const showingFrom = filtered.length === 0 ? 0 : start + 1;
  const showingTo = Math.min(start + pageSize, filtered.length);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(item: MediaItem) {
    setEditing(item);
    setModalOpen(true);
  }

  function handleSave(item: MediaItem) {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      if (exists) return prev.map((p) => (p.id === item.id ? item : p));
      return [item, ...prev];
    });
    setModalOpen(false);
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (typeof window !== "undefined" && !window.confirm("ต้องการลบสื่อนี้ใช่หรือไม่?")) return;
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  function toggleFavorite(id: string) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)));
  }

  return (
    <div className="space-y-5">
      <MediaHeader onAdd={openAdd} isAdmin={isAdmin} />

      <MediaFilters
        search={search}
        onSearch={setSearch}
        type={type}
        onType={setType}
        grade={grade}
        onGrade={setGrade}
        category={category}
        onCategory={setCategory}
        sort={sort}
        onSort={setSort}
      />

      <MediaGrid items={visible} onToggleFavorite={toggleFavorite} onEdit={openEdit} onDelete={handleDelete} isAdmin={isAdmin} />

      {/* แถบเลขหน้า */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-bold text-slate-500">
          แสดง {showingFrom}–{showingTo} จาก {filtered.length} รายการ
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="grid h-9 w-9 place-items-center rounded-lg border border-brand-100 bg-white text-brand-700 transition hover:bg-brand-50 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn(
                "grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-extrabold transition",
                p === currentPage
                  ? "bg-brand-600 text-white"
                  : "border border-brand-100 bg-white text-brand-700 hover:bg-brand-50",
              )}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={currentPage === pageCount}
            className="grid h-9 w-9 place-items-center rounded-lg border border-brand-100 bg-white text-brand-700 transition hover:bg-brand-50 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="h-9 rounded-lg border border-brand-100 bg-white px-2 text-sm font-bold text-brand-700 outline-none"
        >
          {[8, 12, 16].map((n) => (
            <option key={n} value={n}>
              แสดง {n} รายการ/หน้า
            </option>
          ))}
        </select>
      </div>

      {/* footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4 text-xs font-bold text-slate-400">
        <span>© 2024 ผจญภัยดินแดนเศษส่วน | สื่อการสอนคุณภาพ เพื่อการเรียนรู้ที่สนุกและเข้าใจง่าย</span>
        <span>เวอร์ชัน 1.0.0</span>
      </div>

      <AddMediaModal open={modalOpen} initial={editing} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}
