import type { Metadata } from "next";

import { HomePageView } from "@/features/home/components/home-page-view";
import { HeroFirstSlide } from "@/features/home/components/hero-first-slide";
import { getHomePageContent } from "@/services/content/get-home-page-content";

export const metadata: Metadata = {
  title: "Home",
  description: "Dermatologika — Skincare clínico respaldado por dermatólogos. Descubre productos y rutinas para cada tipo de piel.",
};

export default async function HomePage() {
  const contentResult = await getHomePageContent();
  const { content } = contentResult;
  const firstHeroSlide = content.hero.slides[0];

  const heroImageSrc = firstHeroSlide?.media?.url && firstHeroSlide.media.kind === "image"
    ? firstHeroSlide.media.url
    : undefined;

  return (
    <>
      {heroImageSrc && (
        <link rel="preload" as="image" href={heroImageSrc} />
      )}
      <div className="bg-gradient-to-b from-[#72b25514] via-white to-white [&_h2]:tracking-[-0.03em]">
        {firstHeroSlide ? <HeroFirstSlide slide={firstHeroSlide} /> : null}
        <HomePageView contentResult={contentResult} />
      </div>
    </>
  );
}
