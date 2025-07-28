/*
  Warnings:

  - A unique constraint covering the columns `[owner_id,ref_id,refType]` on the table `comments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `refType` to the `comments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CommentRefType" AS ENUM ('Idea', 'Comment');

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_ref_id_fkey";

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "refType" "CommentRefType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "comments_owner_id_ref_id_refType_key" ON "comments"("owner_id", "ref_id", "refType");
