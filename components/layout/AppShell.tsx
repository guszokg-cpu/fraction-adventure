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
};

export function AppShell({ children, title, eyebrow, description, activePath, aside }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-sky-50/70">
      <Sidebar activePath={activePath} />
      <main className="flex min-w-0 flex-1 gap-5 p-5">
        <section className="min-w-0 flex-1 space-y-5">
          <TopBar />
          <PageHeader title={title} eyebrow={eyebrow} description={description} />
          {children}
        </section>
        {aside ? <aside className="w-[330px] shrink-0">{aside}</aside> : <RightPanel />}
      </main>
    </div>
  );
}
