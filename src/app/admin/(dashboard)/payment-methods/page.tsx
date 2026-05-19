import { PaymentMethodAdminPanel } from "@/features/admin-payment-methods/components/payment-method-admin-panel";
import { getAdminPaymentMethods } from "@/services/admin-payment-methods/get-payment-methods";

export const metadata = {
  title: "Admin Métodos de pago — Dermatologika",
  description: "Gestionar los métodos de pago disponibles en el checkout.",
};

export default async function AdminPaymentMethodsPage() {
  const methods = await getAdminPaymentMethods();
  return <PaymentMethodAdminPanel initialMethods={methods} />;
}
