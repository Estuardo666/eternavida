export interface MediaFolderSummary {
  id: string;
  name: string;
  parentId: string | null;
  childrenCount: number;
  assetCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFolderTree extends MediaFolderSummary {
  children: MediaFolderTree[];
}
