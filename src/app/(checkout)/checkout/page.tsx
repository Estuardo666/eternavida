import type { Metadata } from "next";

import { CheckoutPageClient } from "@/features/checkout/components/checkout-page";

export const metadata: Metadata = {
  title: "Checkout | Eterna Vida",
  description: "Completa tu pedido de manera segura.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
