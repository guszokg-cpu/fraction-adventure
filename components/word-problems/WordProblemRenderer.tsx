"use client";

import dynamic from "next/dynamic";
import type { WPId } from "@/data/wordProblems";

function Loading() {
  return (
    <div className="grid place-items-center rounded-2xl border-2 border-dashed border-violet-200 bg-white/60 py-16 text-sm font-extrabold text-violet-400">
      กำลังโหลดโจทย์…
    </div>
  );
}

const RENDERERS: Record<WPId, React.ComponentType> = {
  "compare-order": dynamic(() => import("./WPCompareOrder").then((m) => m.WPCompareOrder), { ssr: false, loading: Loading }),
  "rank-statement": dynamic(() => import("./WPRankStatement").then((m) => m.WPRankStatement), { ssr: false, loading: Loading }),
  "order-choice": dynamic(() => import("./WPOrderChoice").then((m) => m.WPOrderChoice), { ssr: false, loading: Loading }),
  "compare-statement": dynamic(() => import("./WPCompareStatement").then((m) => m.WPCompareStatement), { ssr: false, loading: Loading }),
  "remainder-area": dynamic(() => import("./WPRemainder").then((m) => m.WPRemainder), { ssr: false, loading: Loading }),
  "max-expression": dynamic(() => import("./WPMaxExpression").then((m) => m.WPMaxExpression), { ssr: false, loading: Loading }),
  "find-whole": dynamic(() => import("./WPFindWhole").then((m) => m.WPFindWhole), { ssr: false, loading: Loading }),
  "remaining-work": dynamic(() => import("./WPRemainingWork").then((m) => m.WPRemainingWork), { ssr: false, loading: Loading }),
  "fraction-of-remainder": dynamic(() => import("./WPFractionOfRemainder").then((m) => m.WPFractionOfRemainder), { ssr: false, loading: Loading }),
};

export function WordProblemRenderer({ id }: { id: WPId }) {
  const C = RENDERERS[id];
  return C ? <C /> : null;
}
