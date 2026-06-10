import { BadgePresetAdminPanel } from "@/features/admin-catalog/components/badge-preset-admin-panel";
import { getProductBadgePresetAdminData } from "@/services/admin-catalog/get-catalog-admin-data";

export const metadata = {
  title: "Admin Badges — Eterna Vida",
  description: "Gestionar presets globales de badge para productos.",
};

export default async function AdminCatalogBadgesPage() {
  const presets = await getProductBadgePresetAdminData();

  return <BadgePresetAdminPanel initialPresets={presets} pageMode="index" />;
}