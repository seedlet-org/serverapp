/*
  Warnings:

  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_ref_id_fkey";

-- DropTable
DROP TABLE "Comment";

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "owner_id" UUID NOT NULL,
    "ref_id" UUID,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_ref_id_fkey" FOREIGN KEY ("ref_id") REFERENCES "ideas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
