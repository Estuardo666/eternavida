import type { Metadata } from "next";

import { CheckoutConfirmation } from "@/features/checkout/components/checkout-confirmation";

export const metadata: Metadata = {
  title: "Pedido confirmado | Eterna Vida",
  robots: { index: false, follow: false },
};

export default function ConfirmationPage() {
  return <CheckoutConfirmation />;
}
