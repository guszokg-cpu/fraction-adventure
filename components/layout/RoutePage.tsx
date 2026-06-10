import { AppShell } from "@/components/layout/AppShell";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { getPageRoute } from "@/data/pageRoutes";

type RoutePageProps = {
  href: string;
};

export function RoutePage({ href }: RoutePageProps) {
  const route = getPageRoute(href);

  if (!route) {
    throw new Error(`Missing route metadata for ${href}`);
  }

  return (
    <AppShell title={route.title} eyebrow={route.eyebrow} description={route.description}>
      <PagePlaceholder route={route} />
    </AppShell>
  );
}
