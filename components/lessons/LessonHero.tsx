import { TopBar } from "@/components/layout/TopBar";

// Fallback gradients — brighter palette so the hero looks vibrant without a photo
const themeGradients: Record<string, string> = {
  blue:    "from-sky-300 via-blue-400 to-indigo-400",
  sky:     "from-cyan-200 via-sky-300 to-blue-400",
  violet:  "from-violet-300 via-purple-400 to-fuchsia-400",
  purple:  "from-purple-300 via-violet-400 to-indigo-400",
  emerald: "from-emerald-300 via-teal-400 to-green-400",
  teal:    "from-teal-300 via-cyan-400 to-emerald-400",
  indigo:  "from-indigo-300 via-blue-400 to-violet-400",
  orange:  "from-amber-300 via-orange-400 to-rose-400",
  pink:    "from-pink-300 via-fuchsia-400 to-rose-400",
};

type LessonHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  heroImage?: string;
  themeColor?: string;
};

export function LessonHero({ eyebrow, title, description, heroImage, themeColor }: LessonHeroProps) {
  const gradient = themeGradients[themeColor ?? "blue"] ?? themeGradients.blue;

  return (
    <div className="relative min-h-[240px] overflow-hidden rounded-3xl shadow-lg sm:min-h-[260px] md:min-h-[280px]">

      {/* 1. Gradient fallback — visible when no image */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

      {/* 2. Hero image — covers full frame */}
      {heroImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
      )}

      {/* 3. Ultra-light left vignette so card edge blends softly — image stays bright */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/8 via-transparent to-transparent" />

      {/* 4. กลับหน้าหลัก — top-right, above card */}
      <div className="absolute right-4 top-4 z-20 lg:right-5 lg:top-5">
        <TopBar />
      </div>

      {/* 5. Title Card — frosted glass panel, left-center */}
      <div className="absolute bottom-5 left-4 z-10 w-[calc(100%-5.5rem)] max-w-[300px] sm:max-w-[380px] md:bottom-7 md:left-6 md:max-w-[460px] lg:left-7 lg:max-w-[540px]">
        <div className="rounded-3xl border border-white/70 bg-white/85 px-6 py-5 shadow-xl backdrop-blur-md md:px-8 md:py-6">

          {/* Badge */}
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-[6px] shadow-[0_3px_14px_rgba(124,58,237,0.38)]">
            <span className="text-[11px]" aria-hidden>⭐</span>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">
              {eyebrow}
            </span>
          </div>

          {/* Title */}
          <h1
            className="font-black leading-tight tracking-tight text-indigo-950"
            style={{ fontSize: "clamp(20px, 3.4vw, 46px)" }}
          >
            {title}
          </h1>

          {/* Sparkle divider */}
          <div className="my-2.5 flex items-center gap-2">
            <div className="h-px w-12 rounded bg-indigo-200" />
            <span className="text-[10px] text-violet-400" aria-hidden>✦</span>
            <div className="h-px w-4 rounded bg-indigo-100" />
          </div>

          {/* Subtitle */}
          <p className="text-[13px] font-semibold text-slate-600 md:text-[15px]">
            {description}
          </p>

        </div>
      </div>

    </div>
  );
}
