"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/* ─────────────────────────────────────────────────────────────
   ทะเบียนคอมโพเนนต์เกมกลาง (คู่กับ data/gameRegistry.ts)

   คีย์ = `${lessonSlug}:${gameId}` ตรงกับที่ประกาศไว้ใน GAME_REGISTRY
   ใช้ร่วมกันทั้ง "โซนเกม" ในบทเรียน และหน้า "เกมเศษส่วน" (/games)
   → ปรับปรุงเกมไฟล์ไหน ทั้งสองหน้าได้ของใหม่ทันที (คอมโพเนนต์ตัวเดียวกัน)

   โหลดแบบ dynamic เพื่อไม่ให้หน้ารวมเกมดึงทุกเกมมาพร้อมกัน
   ───────────────────────────────────────────────────────────── */

const Loading = () => (
  <div className="flex min-h-[280px] items-center justify-center rounded-2xl bg-slate-50">
    <div className="flex flex-col items-center gap-2 text-slate-400">
      <span className="animate-bounce text-3xl">🎮</span>
      <span className="text-sm font-extrabold">กำลังโหลดเกม…</span>
    </div>
  </div>
);


export const GAME_COMPONENTS: Record<string, ComponentType> = {
  /* รู้จักเศษส่วน */
  "fraction-intro:witchcake": dynamic(() => import("@/components/lessons/fraction-intro/IntroWitchCakeGame").then((m) => m.IntroWitchCakeGame), { ssr: false, loading: Loading }),
  "fraction-intro:bee":       dynamic(() => import("@/components/lessons/fraction-intro/IntroBeeGardenGame").then((m) => m.IntroBeeGardenGame), { ssr: false, loading: Loading }),
  "fraction-intro:robot":     dynamic(() => import("@/components/lessons/fraction-intro/IntroRobotChargeGame").then((m) => m.IntroRobotChargeGame), { ssr: false, loading: Loading }),
  "fraction-intro:pond":      dynamic(() => import("@/components/lessons/fraction-intro/FishingPondGame").then((m) => m.FishingPondGame), { ssr: false, loading: Loading }),

  /* ประเภทของเศษส่วน */
  "read-write:bus":      dynamic(() => import("@/components/lessons/fraction-types/TypesBusGame").then((m) => m.TypesBusGame), { ssr: false, loading: Loading }),
  "read-write:kitchen":  dynamic(() => import("@/components/lessons/fraction-types/TypesKitchenGame").then((m) => m.TypesKitchenGame), { ssr: false, loading: Loading }),
  "read-write:gate":     dynamic(() => import("@/components/lessons/fraction-types/TypesGateGame").then((m) => m.TypesGateGame), { ssr: false, loading: Loading }),
  "read-write:treasure": dynamic(() => import("@/components/lessons/fraction-types/TreasureSortGame").then((m) => m.TreasureSortGame), { ssr: false, loading: Loading }),

  /* เปรียบเทียบเศษส่วน */
  "compare:race":    dynamic(() => import("@/components/lessons/compare/RaceTrackGame").then((m) => m.RaceTrackGame), { ssr: false, loading: Loading }),
  "compare:balance": dynamic(() => import("@/components/lessons/compare/FractionScaleGame").then((m) => m.FractionScaleGame), { ssr: false, loading: Loading }),
  "compare:duel":    dynamic(() => import("@/components/lessons/compare/FractionCardDuel").then((m) => m.FractionCardDuel), { ssr: false, loading: Loading }),
  "compare:gates":   dynamic(() => import("@/components/lessons/compare/FractionGateGame").then((m) => m.FractionGateGame), { ssr: false, loading: Loading }),

  /* เศษส่วนที่เท่ากัน */
  "equivalent:jar":     dynamic(() => import("@/components/lessons/equivalent/FishJarGame").then((m) => m.FishJarGame), { ssr: false, loading: Loading }),
  "equivalent:choc":    dynamic(() => import("@/components/lessons/equivalent/FractionChocFactory").then((m) => m.FractionChocFactory), { ssr: false, loading: Loading }),
  "equivalent:train":   dynamic(() => import("@/components/lessons/equivalent/FractionTrainGame").then((m) => m.FractionTrainGame), { ssr: false, loading: Loading }),
  "equivalent:balloon": dynamic(() => import("@/components/lessons/equivalent/FractionBalloonGame").then((m) => m.FractionBalloonGame), { ssr: false, loading: Loading }),

  /* เศษส่วนอย่างต่ำ */
  "simplify-expand:shrink": dynamic(() => import("@/components/lessons/simplify-expand/SimplifyShrinkMachine").then((m) => m.SimplifyShrinkMachine), { ssr: false, loading: Loading }),
  "simplify-expand:rocket": dynamic(() => import("@/components/lessons/simplify-expand/SimplifyRocketGame").then((m) => m.SimplifyRocketGame), { ssr: false, loading: Loading }),

  /* จำนวนคละและเศษเกิน */
  "mixed-improper:pizza": dynamic(() => import("@/components/lessons/mixed-improper/MixedPizzaGame").then((m) => m.MixedPizzaGame), { ssr: false, loading: Loading }),
  "mixed-improper:juice": dynamic(() => import("@/components/lessons/mixed-improper/MixedJuiceGame").then((m) => m.MixedJuiceGame), { ssr: false, loading: Loading }),
  "mixed-improper:mix":   dynamic(() => import("@/components/lessons/mixed-improper/MixedPenaltyGame").then((m) => m.MixedPenaltyGame), { ssr: false, loading: Loading }),
  "mixed-improper:boss":  dynamic(() => import("@/components/lessons/mixed-improper/DragonBossGame").then((m) => m.DragonBossGame), { ssr: false, loading: Loading }),

  /* บวกเศษส่วน */
  "add:juice":  dynamic(() => import("@/components/lessons/add/AddJuiceTankGame").then((m) => m.AddJuiceTankGame), { ssr: false, loading: Loading }),
  "add:drink":  dynamic(() => import("@/components/lessons/add/AddMixedDrinkGame").then((m) => m.AddMixedDrinkGame), { ssr: false, loading: Loading }),
  "add:bridge": dynamic(() => import("@/components/lessons/add/AddBridgeGame").then((m) => m.AddBridgeGame), { ssr: false, loading: Loading }),
  "add:whole":  dynamic(() => import("@/components/lessons/add/AddJourneyGame").then((m) => m.AddJourneyGame), { ssr: false, loading: Loading }),
  "add:race":   dynamic(() => import("@/components/lessons/add/AddRaceGame").then((m) => m.AddRaceGame), { ssr: false, loading: Loading }),

  /* ลบเศษส่วน */
  "subtract:fishjar": dynamic(() => import("@/components/lessons/subtract/SubtractFishJarGame").then((m) => m.SubtractFishJarGame), { ssr: false, loading: Loading }),
  "subtract:choco":   dynamic(() => import("@/components/lessons/subtract/SubtractChocoGame").then((m) => m.SubtractChocoGame), { ssr: false, loading: Loading }),
  "subtract:balance": dynamic(() => import("@/components/lessons/subtract/SubtractBalanceGame").then((m) => m.SubtractBalanceGame), { ssr: false, loading: Loading }),
  "subtract:cake":    dynamic(() => import("@/components/lessons/subtract/SubtractCakeShopGame").then((m) => m.SubtractCakeShopGame), { ssr: false, loading: Loading }),
  "subtract:bottle":  dynamic(() => import("@/components/lessons/subtract/SubtractBottleGame").then((m) => m.SubtractBottleGame), { ssr: false, loading: Loading }),

  /* คูณเศษส่วน */
  "multiply:market": dynamic(() => import("@/components/lessons/multiply/MultiplyMarketGame").then((m) => m.MultiplyMarketGame), { ssr: false, loading: Loading }),
  "multiply:money":  dynamic(() => import("@/components/lessons/multiply/MultiplyMoneyGame").then((m) => m.MultiplyMoneyGame), { ssr: false, loading: Loading }),
  "multiply:garden": dynamic(() => import("@/components/lessons/multiply/MultiplyGardenGame").then((m) => m.MultiplyGardenGame), { ssr: false, loading: Loading }),
  "multiply:tower":  dynamic(() => import("@/components/lessons/multiply/MultiplyTowerGame").then((m) => m.MultiplyTowerGame), { ssr: false, loading: Loading }),

  /* หารเศษส่วน */
  "divide:ribbon": dynamic(() => import("@/components/lessons/divide/DivideRibbonGame").then((m) => m.DivideRibbonGame), { ssr: false, loading: Loading }),
  "divide:cake":   dynamic(() => import("@/components/lessons/divide/DivideCakeShareGame").then((m) => m.DivideCakeShareGame), { ssr: false, loading: Loading }),
  "divide:bottle": dynamic(() => import("@/components/lessons/divide/DivideBottleGame").then((m) => m.DivideBottleGame), { ssr: false, loading: Loading }),
  "divide:frog":   dynamic(() => import("@/components/lessons/divide/DivideFrogGame").then((m) => m.DivideFrogGame), { ssr: false, loading: Loading }),
};

/** เรนเดอร์เกมจาก slug + id (ใช้ได้ทั้งในบทเรียนและหน้ารวมเกม) */
export function GameRenderer({ slug, id }: { slug: string; id: string }) {
  const Cmp = GAME_COMPONENTS[`${slug}:${id}`];
  if (!Cmp) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-sm font-bold text-slate-400">
        ยังไม่ได้ลงทะเบียนเกมนี้ ({slug}:{id})
      </div>
    );
  }
  return <Cmp />;
}
