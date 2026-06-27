import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { FractionText } from "@/components/fractions/FractionText";
import { LessonMissionCard } from "@/components/lessons/LessonMissionCard";
import { SimplifyExpandContent } from "@/components/lessons/simplify-expand/SimplifyExpandContent";
import { SimplifyTipsPanel } from "@/components/lessons/simplify-expand/SimplifyTipsPanel";
import { Card } from "@/components/ui/Card";
import { simplifyExpandMeta, simplifyExpandMissions } from "@/data/lessonSimplifyExpand";

export default function SimplifyExpandPage() {
  return (
    <AppShell
      title="ย่อและขยายเศษส่วน"
      eyebrow="Lesson 7"
      description="ทำให้เท่ากัน โดยค่าไม่เปลี่ยน"
      activePath="/lessons/simplify-expand"
      heroImage={simplifyExpandMeta.heroImage}
      themeColor={simplifyExpandMeta.themeColor}
      aside={
        <div className="space-y-4">
          <SimplifyTipsPanel />
          <LessonMissionCard missions={simplifyExpandMissions} />

          <Card className="overflow-hidden p-0">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-white">
              <h2 className="text-lg font-extrabold">ตัวอย่างเชื่อมไปหน้า 9</h2>
            </div>
            <div className="flex items-center justify-between gap-3 p-5">
              <div>
                <FractionText numerator={5} denominator={4} className="text-4xl" toneClassName="text-orange-600" />
                <p className="mt-2 text-xs font-bold text-slate-600">ย่อได้ไหม? หรือเขียนเป็นจำนวนคละได้?</p>
              </div>
              <Link
                href={simplifyExpandMeta.nextHref}
                aria-label="ไปต่อบทเรียนถัดไป"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-orange-500 text-white transition hover:bg-orange-600"
              >
                <ArrowRight size={22} />
              </Link>
            </div>
          </Card>
        </div>
      }
    >
      <SimplifyExpandContent />
    </AppShell>
  );
}
