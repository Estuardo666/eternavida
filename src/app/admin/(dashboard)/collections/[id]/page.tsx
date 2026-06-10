import { CollectionFormPanel } from "@/features/admin-collections/components/collection-form-panel";

export const metadata = {
  title: "Editar Colección — Eterna Vida",
  description: "Editar colección existente.",
};

export default async function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CollectionFormPanel mode="edit" collectionId={id} />;
}
