"use client";

export function SidebarBrandCard() {
  return (
    <div
      className={[
        // Layout
        "group relative overflow-hidden rounded-3xl px-4 py-3.5",
        // Gradient background
        "bg-gradient-to-br from-pink-500 via-fuchsia-600 to-purple-700",
        // Border + glow
        "border border-pink-300/40",
        "shadow-[0_0_22px_rgba(236,72,153,0.48),0_4px_14px_rgba(0,0,0,0.28)]",
        // Hover
        "transition-all duration-200 ease-out cursor-default select-none",
        "hover:scale-[1.015]",
        "hover:shadow-[0_0_36px_rgba(236,72,153,0.68),0_6px_20px_rgba(0,0,0,0.32)]",
      ].join(" ")}
    >
      {/* ── Glow blobs ──────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-pink-300/20 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -left-8 h-36 w-40 rounded-full bg-purple-950/50 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-6 right-0 h-24 w-24 rounded-full bg-fuchsia-900/35 blur-xl"
      />

      {/* ── Dot / star pattern overlay ───────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18'%3E%3Ccircle cx='2.5' cy='2.5' r='1.3' fill='white'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ── Sparkles ─────────────────────────────────── */}
      <span aria-hidden className="pointer-events-none absolute right-4 top-2 text-[15px] text-yellow-200/90">✦</span>
      <span aria-hidden className="pointer-events-none absolute right-9 top-5 text-[9px]  text-white/50">✦</span>
      <span aria-hidden className="pointer-events-none absolute right-3 bottom-3 text-[9px]  text-pink-100/55">✧</span>
      <span aria-hidden className="pointer-events-none absolute left-[72px] top-1 text-[10px] text-yellow-100/60">✦</span>
      <span aria-hidden className="pointer-events-none absolute left-10 bottom-1.5 text-[8px] text-white/35">⋆</span>

      {/* ── Main content ─────────────────────────────── */}
      <div className="relative flex items-center gap-3">
        {/* Pizza logo */}
        <div
          className="shrink-0 text-[52px] leading-none"
          style={{ filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.38))" }}
        >
          🍕
        </div>

        {/* Text block */}
        <div className="min-w-0">
          <p
            className="text-[17px] font-extrabold leading-tight text-white"
            style={{ textShadow: "0 1px 5px rgba(0,0,0,0.22)" }}
          >
            ผจญภัย
          </p>
          <p
            className="text-[17px] font-extrabold leading-tight text-amber-300"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.30)" }}
          >
            ดินแดนเศษส่วน
          </p>
          <p className="mt-0.5 text-[10px] font-semibold text-pink-100/85">
            เรียนเศษส่วน ป.4-ป.6
          </p>
        </div>
      </div>
    </div>
  );
}
