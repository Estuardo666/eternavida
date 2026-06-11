import "server-only";

import { fallbackAboutPageContent } from "@/server/content/about-page-content.fallback";
import { readStoredAboutPageContent } from "@/server/content/about-page-content.source";
import type { AboutPageContentResult } from "@/types/about-content";

export async function getAboutPageContent(): Promise<AboutPageContentResult> {
  const storedContent = await readStoredAboutPageContent();

  if (storedContent) {
    return {
      content: storedContent,
      source: "database",
    };
  }

  return {
    content: fallbackAboutPageContent,
    source: "fallback",
  };
}
