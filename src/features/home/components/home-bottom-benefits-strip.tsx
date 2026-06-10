import { Leaf, Factory, Truck, Heart, Recycle } from "lucide-react";

const benefits = [
  {
    id: "natural",
    label: "100% natural",
    icon: Leaf,
  },
  {
    id: "artisan",
    label: "Producción artesanal",
    icon: Factory,
  },
  {
    id: "shipping",
    label: "Envíos a todo Ecuador",
    icon: Truck,
  },
  {
    id: "social",
    label: "Impacto social",
    icon: Heart,
  },
  {
    id: "environment",
    label: "Compromiso ambiental",
    icon: Recycle,
  },
] as const;

export function HomeBottomBenefitsStrip() {
  return (
    <section aria-label="Beneficios de compra" className="border-y border-border-soft bg-surface-soft/50">
      <div className="container py-8 sm:py-10">
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
          {benefits.map(({ id, icon: Icon, label }) => (
            <li key={id} className="flex flex-col items-center justify-center gap-3 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border-soft bg-surface-canvas text-text-secondary">
                <Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <p className="max-w-[11ch] text-body-sm leading-tight text-text-secondary">{label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
