-- CreateTable: Collection
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "excerpt" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "mediaAssetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Collection
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");
CREATE INDEX "Collection_isActive_idx" ON "Collection"("isActive");
CREATE INDEX "Collection_slug_idx" ON "Collection"("slug");
CREATE INDEX "Collection_sortOrder_idx" ON "Collection"("sortOrder");
CREATE INDEX "Collection_mediaAssetId_idx" ON "Collection"("mediaAssetId");
CREATE INDEX "Collection_createdAt_idx" ON "Collection"("createdAt");

-- AddForeignKey: Collection -> MediaAsset
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: CollectionProduct
CREATE TABLE "CollectionProduct" (
    "collectionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionProduct_pkey" PRIMARY KEY ("collectionId", "productId")
);

-- CreateIndex: CollectionProduct
CREATE INDEX "CollectionProduct_productId_idx" ON "CollectionProduct"("productId");
CREATE INDEX "CollectionProduct_collectionId_position_idx" ON "CollectionProduct"("collectionId", "position");

-- AddForeignKey: CollectionProduct -> Collection
ALTER TABLE "CollectionProduct" ADD CONSTRAINT "CollectionProduct_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: CollectionProduct -> Product
ALTER TABLE "CollectionProduct" ADD CONSTRAINT "CollectionProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: CollectionCategory
CREATE TABLE "CollectionCategory" (
    "collectionId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionCategory_pkey" PRIMARY KEY ("collectionId", "categoryId")
);

-- CreateIndex: CollectionCategory
CREATE INDEX "CollectionCategory_categoryId_idx" ON "CollectionCategory"("categoryId");
CREATE INDEX "CollectionCategory_collectionId_position_idx" ON "CollectionCategory"("collectionId", "position");

-- AddForeignKey: CollectionCategory -> Collection
ALTER TABLE "CollectionCategory" ADD CONSTRAINT "CollectionCategory_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: CollectionCategory -> Category
ALTER TABLE "CollectionCategory" ADD CONSTRAINT "CollectionCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
