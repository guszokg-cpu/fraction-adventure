import { AppShell } from "@/components/layout/AppShell";
import { PlaceholderPanel } from "@/components/ui/PlaceholderPanel";

export default function GamesPage() {
  return (
    <AppShell title="แบบฝึกหัด / เกม" eyebrow="Practice Games" description="เกมฝึกทักษะเศษส่วนแบบสนุก" activePath="/games">
      <PlaceholderPanel title="เกมเศษส่วน" description="Phase 1 วางช่องทางเข้าเกม ก่อนเพิ่ม logic ใน Phase 3" />
    </AppShell>
  );
}
