import { Card } from "@/components/ui/Card";
import type { PageRoute } from "@/data/pageRoutes";

type PagePlaceholderProps = {
  route: PageRoute;
};

export function PagePlaceholder({ route }: PagePlaceholderProps) {
  return (
    <Card className="min-h-[520px]">
      <div className="flex h-full min-h-[460px] items-center justify-center text-center">
        <div className="max-w-xl">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-brand-50 text-6xl shadow-inner">
            {route.icon}
          </div>
          <div className="mt-5 text-sm font-extrabold text-brand-600">หน้า {route.order} จาก 19</div>
          <h2 className="mt-2 text-3xl font-extrabold text-brand-900">{route.title}</h2>
          <p className="mt-3 text-lg font-semibold text-slate-600">{route.description}</p>
          <div className="mx-auto mt-6 max-w-md rounded-xl border border-dashed border-brand-100 bg-brand-50/60 px-5 py-4 text-sm font-bold text-brand-700">
            Placeholder สำหรับ Phase ถัดไป ใช้ layout และ navigation เดียวกับทั้งเว็บ
          </div>
        </div>
      </div>
    </Card>
  );
}
