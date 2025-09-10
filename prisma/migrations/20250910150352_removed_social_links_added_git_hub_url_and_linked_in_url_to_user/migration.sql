/*
  Warnings:

  - You are about to drop the column `social_links` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "social_links",
ADD COLUMN     "github_url" VARCHAR(100),
ADD COLUMN     "linkedin_url" VARCHAR(100);
