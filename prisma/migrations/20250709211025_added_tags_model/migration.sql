/*
  Warnings:

  - You are about to drop the column `tags` on the `ideas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ideas" DROP COLUMN "tags";

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_IdeaTags" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_IdeaTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_title_key" ON "tags"("title");

-- CreateIndex
CREATE INDEX "_IdeaTags_B_index" ON "_IdeaTags"("B");

-- AddForeignKey
ALTER TABLE "_IdeaTags" ADD CONSTRAINT "_IdeaTags_A_fkey" FOREIGN KEY ("A") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IdeaTags" ADD CONSTRAINT "_IdeaTags_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
