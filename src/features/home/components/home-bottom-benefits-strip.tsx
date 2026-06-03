import { Headset, ShieldCheck, ShoppingCart, Tag, Truck } from "lucide-react";

const benefits = [
  {
    id: "secure-payments",
    label: "Pagos 100% seguros",
    icon: ShieldCheck,
  },
  {
    id: "safe-shipping",
    label: "Envíos 100% seguros",
    icon: Truck,
  },
  {
    id: "special-discounts",
    label: "Descuentos especiales",
    icon: Tag,
  },
  {
    id: "online-shopping",
    label: "Compras online 24/7",
    icon: ShoppingCart,
  },
  {
    id: "online-support",
    label: "Asesoría online",
    icon: Headset,
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
