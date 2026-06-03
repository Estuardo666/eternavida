import { BestOffersSection } from "@/features/home/components/best-offers-section";
import { CtaSection } from "@/features/home/components/cta-section";
import { FeaturedCategoriesGridSection } from "@/features/home/components/featured-categories-grid-section";
import { FeaturedCategoryProductsSection } from "@/features/home/components/featured-category-products-section";
import { HeroSection } from "@/features/home/components/hero-section";
import { HomeBottomBenefitsStrip } from "@/features/home/components/home-bottom-benefits-strip";
import { PromoCollectionSection } from "@/features/home/components/promo-collection-section";
import { WideBannerSection } from "@/features/home/components/wide-banner-section";
import type { HomePageContentResult } from "@/types/content";

interface HomePageViewProps {
  contentResult: HomePageContentResult;
}

export function HomePageView({ contentResult }: HomePageViewProps) {
  const { content } = contentResult;

  return (
    <div className="bg-gradient-to-b from-[#72b25514] via-white to-white [&_h2]:tracking-[-0.03em]">
      <HeroSection content={content.hero} />
      <BestOffersSection content={content.featuredProducts} />
      <PromoCollectionSection content={content.featuredCampaign} />
      <FeaturedCategoryProductsSection content={content.featuredProducts} />
      <WideBannerSection content={content.routinePromo} />
      <FeaturedCategoriesGridSection content={content.featuredCategories} />
      <CtaSection content={content.cta} />
      <HomeBottomBenefitsStrip />
    </div>
  );
}
