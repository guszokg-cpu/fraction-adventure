import { AppShell } from "@/components/layout/AppShell";
import { PlaceholderPanel } from "@/components/ui/PlaceholderPanel";

export default function MediaPage() {
  return (
    <AppShell title="คลังสื่อการสอน" eyebrow="Media Library" description="รวบรวมภาพ เสียง และสื่อประกอบบทเรียน" activePath="/media">
      <PlaceholderPanel title="คลังสื่อ" description="Phase 1 เตรียมหน้าไว้สำหรับจัดเก็บภาพและเสียงใน public" />
    </AppShell>
  );
}
