CREATE TABLE "CategoryBrand" (
  "categoryId" TEXT NOT NULL,
  "brandId" TEXT NOT NULL,
  CONSTRAINT "CategoryBrand_pkey" PRIMARY KEY ("categoryId","brandId"),
  CONSTRAINT "CategoryBrand_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CategoryBrand_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "CategoryBrand_brandId_idx" ON "CategoryBrand"("brandId");