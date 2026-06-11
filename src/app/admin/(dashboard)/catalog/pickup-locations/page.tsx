import { PickupLocationAdminPanel } from "@/features/admin-catalog/components/pickup-location-admin-panel";
import { getPickupLocationAdminData } from "@/services/admin-catalog/get-catalog-admin-data";

export const metadata = {
  title: "Admin Pickup Locations — Eterna Vida",
  description: "Gestionar puntos de retiro para pedidos.",
};

export default async function AdminCatalogPickupLocationsPage() {
  const pickupLocations = await getPickupLocationAdminData();

  return <PickupLocationAdminPanel initialLocations={pickupLocations} />;
}
