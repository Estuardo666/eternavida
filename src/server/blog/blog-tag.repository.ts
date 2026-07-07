import "server-only";

import { prisma } from "@/server/db/prisma";

export async function listAllTags() {
  return prisma.blogTag.findMany({ orderBy: { name: "asc" } });
}

export async function findOrCreateTags(names: string[]) {
  const results: { id: string; slug: string; name: string }[] = [];

  for (const name of names) {
    const trimmed = name.trim();
    if (!trimmed) continue;

    const slug = trimmed
      .normalize("NFKD")
      .replace(/[^\x00-\x7F]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    if (!slug) continue;

    const tag = await prisma.blogTag.upsert({
      where: { slug },
      update: { name: trimmed },
      create: { slug, name: trimmed },
      select: { id: true, slug: true, name: true },
    });

    results.push(tag);
  }

  return results;
}

export async function syncPostTags(postId: string, tagNames: string[]) {
  await prisma.blogPostTag.deleteMany({ where: { postId } });

  if (tagNames.length === 0) return;

  const tags = await findOrCreateTags(tagNames);

  await prisma.blogPostTag.createMany({
    data: tags.map((tag) => ({ postId, tagId: tag.id })),
    skipDuplicates: true,
  });
}
