import { MobileNav } from "@/components/layout/MobileNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { RightPanel } from "@/components/layout/RightPanel";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

type AppShellProps = {
  children: React.ReactNode;
  title: string;
  eyebrow: string;
  description: string;
  activePath?: string;
  aside?: React.ReactNode;
  hideHeader?: boolean;
};

export function AppShell({ children, title, eyebrow, description, activePath, aside, hideHeader }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-sky-50/70">
      <Sidebar activePath={activePath} />
      <main className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-24 lg:flex-row lg:p-5 lg:pb-5">
        <section className="min-w-0 flex-1 space-y-5">
          <TopBar />
          {!hideHeader && <PageHeader title={title} eyebrow={eyebrow} description={description} />}
          {children}
        </section>
        {aside ? <aside className="w-full shrink-0 lg:w-[330px]">{aside}</aside> : <RightPanel />}
      </main>
      <MobileNav activePath={activePath} />
    </div>
  );
}
