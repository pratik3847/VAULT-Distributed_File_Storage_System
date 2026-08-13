const prisma = require("../config/prisma");
const uploadService = require("../services/upload.service");
const fileService = require("../services/file.service");
const userRepository = require("../repositories/user.repository");
const bcrypt = require("bcrypt");

// Mock S3 so test doesn't attempt external network requests
const storageService = require("../services/storage.service");
storageService.uploadToS3 = async () => true;
storageService.deleteFromS3 = async () => true;

async function runTest() {
  console.log("Starting File Chunk Deletion Test...");

  // 1. Find or create a test user
  let user = await prisma.user.findFirst({ where: { email: "chunktest@example.com" } });
  if (!user) {
    const hashedPassword = await bcrypt.hash("password123", 10);
    user = await prisma.user.create({
      data: {
        name: "Chunk Test User",
        email: "chunktest@example.com",
        password: hashedPassword,
      },
    });
  }

  // 2. Initialize upload session
  const initResult = await uploadService.initUpload({
    originalName: "test-chunk-file.txt",
    mimeType: "text/plain",
    totalSize: 10,
    ownerId: user.id,
  });

  const uploadId = initResult.uploadId;
  console.log(`Upload session initialized: ${uploadId}`);

  // 3. Upload a chunk
  const dummyChunkBuffer = Buffer.from("0123456789");
  await uploadService.uploadChunk({
    uploadId,
    chunkNumber: 0,
    file: { size: 10, buffer: dummyChunkBuffer },
    ownerId: user.id,
  });

  // Verify chunk exists in DB
  let chunkCount = await prisma.fileChunk.count({ where: { uploadSessionId: uploadId } });
  console.log(`FileChunk count before completeUpload: ${chunkCount}`);
  if (chunkCount !== 1) {
    throw new Error(`Expected 1 chunk, found ${chunkCount}`);
  }

  // 4. Complete upload session (creates File & links UploadSession)
  const completeResult = await uploadService.completeUpload(uploadId, user.id);
  const fileId = completeResult.id;
  console.log(`File created with ID: ${fileId}`);

  // Verify UploadSession is linked and status is COMPLETED
  const sessionAfterComplete = await prisma.uploadSession.findUnique({
    where: { id: uploadId },
  });
  console.log(`UploadSession status after complete: ${sessionAfterComplete?.status}, fileId: ${sessionAfterComplete?.fileId}`);

  if (sessionAfterComplete?.fileId !== fileId) {
    throw new Error(`UploadSession fileId expected ${fileId}, got ${sessionAfterComplete?.fileId}`);
  }

  // Verify chunks still exist while file exists
  chunkCount = await prisma.fileChunk.count({ where: { uploadSessionId: uploadId } });
  console.log(`FileChunk count after completeUpload: ${chunkCount}`);

  // 5. Delete the file
  await fileService.deleteFile(fileId, user.id);
  console.log(`File ${fileId} deleted via fileService.deleteFile`);

  // 6. Verify that UploadSession AND FileChunk records were cascade deleted!
  const remainingSession = await prisma.uploadSession.findUnique({ where: { id: uploadId } });
  const remainingChunks = await prisma.fileChunk.count({ where: { uploadSessionId: uploadId } });

  console.log(`Remaining UploadSession count: ${remainingSession ? 1 : 0}`);
  console.log(`Remaining FileChunk count: ${remainingChunks}`);

  if (remainingSession || remainingChunks > 0) {
    console.error("FAILED: Chunks or UploadSession still remain in DB!");
    process.exit(1);
  } else {
    console.log("SUCCESS: FileChunk and UploadSession were automatically deleted from DB on file deletion!");
  }

  // Cleanup test user
  await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
  process.exit(0);
}

runTest().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
