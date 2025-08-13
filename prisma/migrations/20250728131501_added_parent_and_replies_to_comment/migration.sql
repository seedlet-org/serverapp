-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_ref_id_fkey" FOREIGN KEY ("ref_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
