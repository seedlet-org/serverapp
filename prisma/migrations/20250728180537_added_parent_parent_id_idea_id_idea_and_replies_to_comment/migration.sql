-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_ref_id_fkey";

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "idea_id" UUID,
ADD COLUMN     "parent_id" UUID;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "ideas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
