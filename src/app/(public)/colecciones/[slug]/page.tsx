import { notFound } from "next/navigation";
import { collectionRepository } from "@/server/collections/collection.repository";
import { CollectionDetailView } from "@/features/catalog/components/collection-detail-view";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await collectionRepository.findBySlug(slug);
  if (!collection) return { title: "Colección no encontrada" };
  return {
    title: collection.name,
    description: collection.description ?? collection.excerpt ?? `Colección ${collection.name} en Dermatologika`,
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await collectionRepository.findBySlug(slug);

  if (!collection || !collection.isActive) {
    notFound();
  }

  return <CollectionDetailView collection={collection} />;
}
