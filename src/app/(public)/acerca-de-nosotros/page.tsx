import type { Metadata } from "next";

import { AboutPageView } from "@/features/about/components/about-page-view";
import { getAboutPageContent } from "@/services/content/get-about-page-content";

export const metadata: Metadata = {
  title: "Acerca de Nosotros — Eterna Vida",
  description:
    "Conoce la historia, misión y valores de Eterna Vida. Productos naturales elaborados con propósito desde Ecuador para tu bienestar y el de tu familia.",
};

export default async function AcercaDeNosotrosPage() {
  const contentResult = await getAboutPageContent();

  return (
    <div className="bg-gradient-to-b from-[#0B5D1E08] via-white to-white [&_h2]:tracking-[-0.03em]">
      <AboutPageView contentResult={contentResult} />
    </div>
  );
}
