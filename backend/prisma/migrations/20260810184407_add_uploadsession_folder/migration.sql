-- AlterTable
ALTER TABLE "UploadSession" ADD COLUMN     "folderId" TEXT;

-- CreateIndex
CREATE INDEX "UploadSession_ownerId_idx" ON "UploadSession"("ownerId");

-- CreateIndex
CREATE INDEX "UploadSession_folderId_idx" ON "UploadSession"("folderId");

-- AddForeignKey
ALTER TABLE "UploadSession" ADD CONSTRAINT "UploadSession_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
