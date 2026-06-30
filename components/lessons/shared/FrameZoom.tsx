"use client";

/**
 * ระบบ "ซูมดูทีละกรอบ + โหมดสไลด์" ใช้ซ้ำได้ทุกบทเรียน — ไม่พึ่ง library ภายนอก
 *
 * วิธีใช้:
 *   <FrameZoomProvider>
 *     <SlideshowButton />                          // ปุ่มเปิดโหมดสไลด์ (เริ่มกรอบแรก)
 *     <ZoomFrame id="x" title="...">{การ์ด}</ZoomFrame>
 *     ...
 *   </FrameZoomProvider>
 *
 * - ZoomFrame ใส่ปุ่ม 🔍 มุมขวาล่างของกรอบ กดแล้วเปิดหน้าต่างซูมที่กรอบนั้น
 * - ในหน้าต่างซูม เลื่อน ◀ ▶ / ปัดนิ้ว / ลูกศรคีย์บอร์ด / Esc ปิด
 * - เนื้อหาที่ซูมเป็นภาพ clone (อ่าน/ดูได้ ไม่โต้ตอบ) จึงเหมาะกับกรอบที่เป็นภาพ/ข้อความ
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ZoomIn, X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/cn";

type Entry = { id: string; title: string; el: HTMLElement };
type Slide = { id: string; title: string; html: string };

type Ctx = {
  register: (id: string, title: string, el: HTMLElement) => void;
  unregister: (id: string) => void;
  open: (id: string) => void;
  openSlideshow: () => void;
};

const FrameZoomCtx = createContext<Ctx | null>(null);

const SWIPE_THRESHOLD = 45;

export function FrameZoomProvider({ children }: { children: ReactNode }) {
  const entries = useRef<Map<string, Entry>>(new Map());
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const register = useCallback((id: string, title: string, el: HTMLElement) => {
    entries.current.set(id, { id, title, el });
  }, []);

  const unregister = useCallback((id: string) => {
    entries.current.delete(id);
  }, []);

  /** เรียงตามลำดับใน DOM แล้ว snapshot เนื้อหาเป็น HTML */
  const buildSlides = useCallback((): Slide[] => {
    const list = [...entries.current.values()].sort((a, b) =>
      a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
    );
    const arr = list.map((e) => ({ id: e.id, title: e.title, html: e.el.innerHTML }));
    setSlides(arr);
    return arr;
  }, []);

  const open = useCallback(
    (id: string) => {
      const arr = buildSlides();
      const idx = arr.findIndex((s) => s.id === id);
      setCurrent(idx >= 0 ? idx : 0);
    },
    [buildSlides]
  );

  const openSlideshow = useCallback(() => {
    const arr = buildSlides();
    if (arr.length > 0) setCurrent(0);
  }, [buildSlides]);

  const close = useCallback(() => setCurrent(null), []);
  const go = useCallback(
    (dir: number) =>
      setCurrent((c) => (c === null ? c : Math.min(slides.length - 1, Math.max(0, c + dir)))),
    [slides.length]
  );

  // คีย์บอร์ด + ล็อกสกอร์ลพื้นหลังเมื่อเปิด
  useEffect(() => {
    if (current === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [current, close, go]);

  const slide = current !== null ? slides[current] : null;

  return (
    <FrameZoomCtx.Provider value={{ register, unregister, open, openSlideshow }}>
      {children}

      {slide && current !== null && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col bg-slate-900/80 p-3 backdrop-blur-sm sm:p-6"
          onClick={(e) => e.target === e.currentTarget && close()}
          onTouchStart={(e) => (touchStartX.current = e.touches[0]?.clientX ?? null)}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
            if (Math.abs(dx) > SWIPE_THRESHOLD) go(dx < 0 ? 1 : -1);
            touchStartX.current = null;
          }}
        >
          {/* แถบบน */}
          <div className="mx-auto flex w-full max-w-3xl shrink-0 items-center justify-between gap-3 px-1 pb-3 text-white">
            <span className="truncate text-base font-extrabold">{slide.title}</span>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold">
                {current + 1} / {slides.length}
              </span>
              <button
                onClick={close}
                aria-label="ปิด"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* เนื้อหา + ลูกศร */}
          <div className="flex min-h-0 flex-1 items-center justify-center gap-2 sm:gap-4">
            <button
              onClick={() => go(-1)}
              disabled={current === 0}
              aria-label="ก่อนหน้า"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:bg-white disabled:opacity-30"
            >
              <ChevronLeft size={22} />
            </button>

            <div className="flex max-h-full min-w-0 flex-1 justify-center overflow-auto">
              <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl sm:p-8">
                <div
                  className="origin-top [&_*]:!cursor-default"
                  dangerouslySetInnerHTML={{ __html: slide.html }}
                />
              </div>
            </div>

            <button
              onClick={() => go(1)}
              disabled={current === slides.length - 1}
              aria-label="ถัดไป"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:bg-white disabled:opacity-30"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* จุดบอกตำแหน่ง */}
          <div className="flex shrink-0 items-center justify-center gap-2 pt-3">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrent(i)}
                aria-label={`ไปกรอบที่ ${i + 1}`}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  i === current ? "w-6 bg-white" : "w-2.5 bg-white/40 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        </div>
      )}
    </FrameZoomCtx.Provider>
  );
}

export function ZoomFrame({
  id,
  title,
  children,
  className,
}: {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(FrameZoomCtx);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!ctx || !el) return;
    ctx.register(id, title, el);
    return () => ctx.unregister(id);
  }, [ctx, id, title]);

  return (
    <div className={cn("group relative h-full", className)}>
      <div ref={ref} className="h-full">
        {children}
      </div>
      {ctx && (
        <button
          onClick={() => ctx.open(id)}
          aria-label={`ขยายดู ${title}`}
          className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-full border border-violet-200 bg-white/90 px-2.5 py-1.5 text-xs font-extrabold text-violet-600 opacity-70 shadow-sm backdrop-blur transition hover:opacity-100 hover:bg-violet-50"
        >
          <ZoomIn size={14} />
          ขยาย
        </button>
      )}
    </div>
  );
}

export function SlideshowButton({ className }: { className?: string }) {
  const ctx = useContext(FrameZoomCtx);
  if (!ctx) return null;
  return (
    <button
      onClick={ctx.openSlideshow}
      className={cn(
        "flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3.5 py-2 text-sm font-extrabold text-violet-600 transition hover:bg-violet-50",
        className
      )}
    >
      <Play size={15} />
      ดูแบบสไลด์
    </button>
  );
}
