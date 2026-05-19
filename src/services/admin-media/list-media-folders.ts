import "server-only";

import { listMediaFolders } from "@/server/media/admin-media-library.repository";
import type { MediaFolderSummary, MediaFolderTree } from "@/types/media-library";

function toSummary(record: {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { children: number; assets: number };
}): MediaFolderSummary {
  return {
    id: record.id,
    name: record.name,
    parentId: record.parentId,
    childrenCount: record._count.children,
    assetCount: record._count.assets,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function buildTree(summaries: MediaFolderSummary[]): MediaFolderTree[] {
  const map = new Map<string, MediaFolderTree>();
  const roots: MediaFolderTree[] = [];

  for (const summary of summaries) {
    map.set(summary.id, { ...summary, children: [] });
  }

  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function listMediaFoldersAsTree(): Promise<MediaFolderTree[]> {
  const records = await listMediaFolders();
  const summaries = records.map(toSummary);
  return buildTree(summaries);
}
