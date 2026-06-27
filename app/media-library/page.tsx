import { AppShell } from "@/components/layout/AppShell";
import { MediaLibraryClient } from "@/components/media-library/MediaLibraryClient";
import { MediaSummaryPanel } from "@/components/media-library/MediaSummaryPanel";

export default function MediaLibraryPage() {
  return (
    <AppShell
      title="คลังสื่อการสอน"
      eyebrow="MEDIA LIBRARY"
      description="จัดเก็บใบงาน ภาพ และลิงก์สื่อการสอนให้ค้นหาและใช้งานได้ง่าย"
      activePath="/media-library"
      aside={<MediaSummaryPanel />}
      hideHeader
    >
      <MediaLibraryClient />
    </AppShell>
  );
}
