import { Card } from "@/components/ui/Card";

type PlaceholderPanelProps = {
  title: string;
  description: string;
};

export function PlaceholderPanel({ title, description }: PlaceholderPanelProps) {
  return (
    <Card className="flex min-h-[420px] items-center justify-center text-center">
      <div className="max-w-xl">
        <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-2xl bg-brand-100 text-4xl">🧭</div>
        <h2 className="text-2xl font-extrabold text-brand-900">{title}</h2>
        <p className="mt-2 text-lg text-slate-600">{description}</p>
      </div>
    </Card>
  );
}
