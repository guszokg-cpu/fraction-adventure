type PageHeaderProps = {
  title: string;
  eyebrow: string;
  description: string;
};

export function PageHeader({ title, eyebrow, description }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-6">
      <div>
        <div className="text-sm font-extrabold uppercase tracking-wide text-brand-600">{eyebrow}</div>
        <h1 className="mt-1 text-[42px] font-extrabold leading-tight text-brand-900">{title}</h1>
        <p className="mt-1 text-lg font-bold text-slate-700">{description}</p>
      </div>
    </header>
  );
}
