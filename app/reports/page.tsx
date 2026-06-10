import { AppShell } from "@/components/layout/AppShell";
import { PlaceholderPanel } from "@/components/ui/PlaceholderPanel";

export default function ReportsPage() {
  return (
    <AppShell title="รายงานผล" eyebrow="Learning Reports" description="เตรียมโครงสร้างรายงานสำหรับครู" activePath="/reports">
      <PlaceholderPanel title="รายงานนักเรียน" description="Phase 1 แสดง mock layout ก่อน ต่อข้อมูลจริงใน Phase 5-6" />
    </AppShell>
  );
}
