import { CollectionFormPanel } from "@/features/admin-collections/components/collection-form-panel";

export const metadata = {
  title: "Nueva Colección — Eterna Vida",
  description: "Crear una nueva colección.",
};

export default function NewCollectionPage() {
  return <CollectionFormPanel mode="create" />;
}
