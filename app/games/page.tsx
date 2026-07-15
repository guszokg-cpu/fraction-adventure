import { AppShell } from "@/components/layout/AppShell";
import { AllGamesContent } from "@/components/games/AllGamesContent";

export const metadata = {
  title: "เกมเศษส่วน | ผจญภัยดินแดนเศษส่วน",
  description: "รวมทุกเกมเศษส่วนจากทุกบทเรียนไว้ที่เดียว พร้อมโหมดครูสำหรับสอนหน้าห้อง",
};

export default function GamesPage() {
  return (
    <AppShell
      title="เกมเศษส่วน"
      eyebrow="Games"
      description="รวมทุกเกมจากทุกบทเรียนไว้ที่เดียว"
      activePath="/games"
      hideHeader
    >
      <AllGamesContent />
    </AppShell>
  );
}
