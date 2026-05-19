import type { Metadata } from "next";

import { MediaLibraryPanel } from "@/features/admin-media/components/media-library-panel";

export const metadata: Metadata = {
  title: "Admin Biblioteca de medios — Dermatologika",
  description: "Gestionar archivos multimedia y carpetas.",
};

export default function AdminMediaLibraryPage() {
  return <MediaLibraryPanel />;
}
