import { requireAdminPageUser } from "@/server/auth/require-admin-page-user";
import { getQrGeneratorData } from "@/services/qr-generator/get-qr-generator-data";
import { QrGeneratorView } from "@/features/qr-generator/components/qr-generator-view";

export const metadata = {
  title: "Generador de QR — Admin — Eterna Vida",
  description: "Generar códigos QR personalizados para páginas y productos.",
};

export default async function QrGeneratorPage() {
  await requireAdminPageUser();
  const data = await getQrGeneratorData();

  return <QrGeneratorView initialData={data} />;
}
