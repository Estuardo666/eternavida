import { BadgePresetAdminPanel } from "@/features/admin-catalog/components/badge-preset-admin-panel";
import { getProductBadgePresetAdminData } from "@/services/admin-catalog/get-catalog-admin-data";

export const metadata = {
  title: "Admin New Badge Preset — Eterna Vida",
  description: "Crear preset global de badge para productos.",
};

export default async function AdminCatalogBadgeNewPage() {
  const presets = await getProductBadgePresetAdminData();

  return <BadgePresetAdminPanel initialPresets={presets} pageMode="create" />;
}