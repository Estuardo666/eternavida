require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const CATEGORIES_DIR = "./public/media/categories";

async function registerCategoryImages() {
  try {
    const files = fs.readdirSync(CATEGORIES_DIR);
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(ext);
    });

    console.log(`Found ${imageFiles.length} image files in ${CATEGORIES_DIR}`);

    for (const file of imageFiles) {
      const storageKey = `catalog/categories/${file}`;
      const publicUrl = `/media/categories/${file}`;

      const result = await prisma.mediaAsset.upsert({
        where: { storageKey },
        update: {
          publicUrl,
          kind: "image",
        },
        create: {
          storageKey,
          publicUrl,
          kind: "image",
          altText: file.replace(/\.[^/.]+$/, ""),
        },
      });

      console.log(`✓ Registered: ${file} (ID: ${result.id})`);
    }

    console.log(
      `\n✓ Successfully registered ${imageFiles.length} category images!`
    );
  } catch (error) {
    console.error("Error registering images:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

registerCategoryImages();
