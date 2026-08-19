import type { Metadata } from "next";

import { HomePageView } from "@/features/home/components/home-page-view";
import { getHomePageContent } from "@/services/content/get-home-page-content";

export const metadata: Metadata = {
  title: "Home",
  description: "Eterna Vida — Productos naturales y artesanales para la salud, el bienestar y la alimentación consciente. Desde Vilcabamba, Ecuador.",
};

export default async function HomePage() {
  const contentResult = await getHomePageContent();

  return (
    <>
      <link rel="preload" as="image" href="/media/vilca.avif" />
      <div className="bg-gradient-to-b from-[#0B5D1E08] via-white to-white [&_h2]:tracking-[-0.03em]">
        <HomePageView contentResult={contentResult} />
      </div>
    </>
  );
}
