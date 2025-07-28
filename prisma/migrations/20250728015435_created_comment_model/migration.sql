/*
  Warnings:

  - You are about to drop the column `ref_id` on the `ideas` table. All the data in the column will be lost.
  - You are about to drop the column `idea_id` on the `likes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,item_id,itemType]` on the table `likes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `itemType` to the `likes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_id` to the `likes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LikeItemType" AS ENUM ('Idea', 'Comment');

-- DropForeignKey
ALTER TABLE "ideas" DROP CONSTRAINT "ideas_ref_id_fkey";

-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_idea_id_fkey";

-- DropIndex
DROP INDEX "likes_user_id_idea_id_key";

-- AlterTable
ALTER TABLE "ideas" DROP COLUMN "ref_id";

-- AlterTable
ALTER TABLE "likes" DROP COLUMN "idea_id",
ADD COLUMN     "itemType" "LikeItemType" NOT NULL,
ADD COLUMN     "item_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "Comment" (
    "id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "owner_id" UUID NOT NULL,
    "ref_id" UUID,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "likes_user_id_item_id_itemType_key" ON "likes"("user_id", "item_id", "itemType");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_ref_id_fkey" FOREIGN KEY ("ref_id") REFERENCES "ideas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
