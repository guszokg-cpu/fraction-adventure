import { AppShell } from "@/components/layout/AppShell";
import { DashboardOverview } from "@/components/learning/DashboardOverview";

export default function HomePage() {
  return (
    <AppShell
      title="ผจญภัยดินแดนเศษส่วน"
      eyebrow="Learning Map"
      description="เรียนเศษส่วน ป.4-ป.6 ด้วยภาพ เกม และภารกิจ"
      hideHeader
    >
      <DashboardOverview />
    </AppShell>
  );
}
