import type { ReactNode } from "react";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <div className="container py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 space-y-3 border-b border-border-soft pb-8">
          <span className="inline-flex rounded-pill border border-border-brand bg-brand-soft px-3 py-1 text-caption uppercase tracking-[0.14em] text-text-brand">
            Información legal
          </span>
          <h1 className="text-headline-md text-text-primary sm:text-headline-lg">{title}</h1>
          <p className="text-body-sm text-text-muted">
            Última actualización: {lastUpdated}
          </p>
        </header>

        <div className="space-y-10">{children}</div>
      </div>
    </div>
  );
}

interface LegalSectionProps {
  title: string;
  children: ReactNode;
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-section-xl font-semibold text-text-primary">{title}</h2>
      <div className="space-y-3 text-body-md text-text-secondary">{children}</div>
    </section>
  );
}

interface LegalListProps {
  items: string[];
}

export function LegalList({ items }: LegalListProps) {
  return (
    <ul className="space-y-2 pl-5">
      {items.map((item, index) => (
        <li key={index} className="relative text-body-md text-text-secondary before:absolute before:-left-4 before:text-text-brand before:content-['·']">
          {item}
        </li>
      ))}
    </ul>
  );
}
