const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const folderRepository = require("../repositories/folder.repository");
const uploadRepository = require("../repositories/upload.repository");
const AppError = require("../utils/appError");
const { Prisma } = require("@prisma/client");
const { uploadToS3 } = require("./storage.service");

const CHUNK_SIZE = 5 * 1024 * 1024;

const initUpload = async ({
  originalName,
  mimeType,
  totalSize,
  folderId,
  ownerId,
  idempotencyKey,
  checksum,
}) => {
  if (folderId) {
    const folder = await folderRepository.findByIdAndOwner(folderId, ownerId);
    if (!folder) {
      throw new AppError("Folder not found", 404);
    }
  }

  // Check idempotency key for active duplicate upload sessions
  if (idempotencyKey) {
    const existingSession = await uploadRepository.findActiveSessionByIdempotencyKey(
      ownerId,
      idempotencyKey
    );
    if (existingSession) {
      return {
        uploadId: existingSession.id,
        chunkSize: existingSession.chunkSize,
        totalChunks: existingSession.totalChunks,
        isExistingSession: true,
      };
    }
  }

  const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);

  const uploadSession = await uploadRepository.createUploadSession({
    originalName,
    mimeType,
    totalSize,
    chunkSize: CHUNK_SIZE,
    totalChunks,
    ownerId,
    folderId: folderId || null,
    idempotencyKey: idempotencyKey || null,
    checksum: checksum || null,
  });

  return {
    uploadId: uploadSession.id,
    chunkSize: uploadSession.chunkSize,
    totalChunks: uploadSession.totalChunks,
  };
};

const uploadChunk = async ({ uploadId, chunkNumber, file, ownerId }) => {
  const uploadSession = await uploadRepository.findUploadSessionByIdAndOwner(
    uploadId,
    ownerId
  );

  if (!uploadSession) {
    throw new AppError("Upload session not found", 404);
  }

  if (uploadSession.status === "COMPLETED") {
    throw new AppError("Upload session already completed", 400);
  }

  if (chunkNumber < 0 || chunkNumber >= uploadSession.totalChunks) {
    throw new AppError("Invalid chunk number", 400);
  }

  if (!file) {
    throw new AppError("No chunk uploaded", 400);
  }

  // Check duplicate before writing anything to disk
  const existingChunk = await uploadRepository.findChunk(uploadId, chunkNumber);

  if (existingChunk) {
    throw new AppError("Chunk already uploaded", 409);
  }

  // Calculate expected chunk size
  const isLastChunk = chunkNumber === uploadSession.totalChunks - 1;

  const expectedChunkSize = isLastChunk
    ? uploadSession.totalSize - uploadSession.chunkSize * (uploadSession.totalChunks - 1)
    : uploadSession.chunkSize;

  if (file.size !== expectedChunkSize) {
    throw new AppError(`Invalid chunk size. Expected ${expectedChunkSize} bytes`, 400);
  }

  // Create chunk directory
  const chunkDirectory = path.join(
    __dirname,
    "../../uploads/sessions",
    uploadId,
    "chunks"
  );

  await fs.mkdir(chunkDirectory, { recursive: true });

  // Chunk filename = chunk number
  const chunkPath = path.join(chunkDirectory, String(chunkNumber));

  // Write chunk to disk
  await fs.writeFile(chunkPath, file.buffer);

  try {
    const chunk = await uploadRepository.createFileChunk({
      chunkNumber,
      size: file.size,
      path: chunkPath,
      uploadSessionId: uploadId,
    });

    // Move session from INITIATED to UPLOADING
    if (uploadSession.status === "INITIATED") {
      await uploadRepository.updateUploadSessionStatus(uploadId, "UPLOADING");
    }

    return chunk;
  } catch (error) {
    // Remove physical chunk if database operation fails
    await fs.unlink(chunkPath).catch(() => {});

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("Chunk already uploaded", 409);
    }

    throw error;
  }
};

const getUploadStatus = async (uploadId, ownerId) => {
  const uploadSession = await uploadRepository.findUploadSessionWithChunks(
    uploadId,
    ownerId
  );

  if (!uploadSession) {
    throw new AppError("Upload session not found", 404);
  }

  const uploadedChunks = uploadSession.chunks.map((chunk) => chunk.chunkNumber);
  const uploadedChunkSet = new Set(uploadedChunks);
  const missingChunks = [];

  for (let i = 0; i < uploadSession.totalChunks; i++) {
    if (!uploadedChunkSet.has(i)) {
      missingChunks.push(i);
    }
  }

  return {
    uploadId: uploadSession.id,
    totalChunks: uploadSession.totalChunks,
    uploadedChunks,
    missingChunks,
    status: uploadSession.status,
  };
};

const completeUpload = async (uploadId, ownerId, clientChecksum = null) => {
  const uploadSession = await uploadRepository.findUploadSessionWithChunks(
    uploadId,
    ownerId
  );

  if (!uploadSession) {
    throw new AppError("Upload session not found", 404);
  }

  if (uploadSession.status === "COMPLETED") {
    throw new AppError("Upload already completed", 400);
  }

  if (uploadSession.chunks.length !== uploadSession.totalChunks) {
    throw new AppError("Upload is incomplete. Missing chunks.", 400);
  }

  const sortedChunks = [...uploadSession.chunks].sort(
    (a, b) => a.chunkNumber - b.chunkNumber
  );

  for (let i = 0; i < sortedChunks.length; i++) {
    if (sortedChunks[i].chunkNumber !== i) {
      throw new AppError("Upload has missing chunks", 400);
    }
  }

  // Create final file directory
  const finalDirectory = path.join(__dirname, "../../uploads/files");
  await fs.mkdir(finalDirectory, { recursive: true });

  const storedName = `${uploadSession.id}-${uploadSession.originalName}`;
  const finalPath = path.join(finalDirectory, storedName);

  // Merge chunks & calculate SHA-256 checksum on the fly
  const hash = crypto.createHash("sha256");
  const fileHandle = await fs.open(finalPath, "w");

  try {
    for (const chunk of sortedChunks) {
      let chunkData;
      try {
        chunkData = await fs.readFile(chunk.path);
      } catch {
        const fallbackPath = path.join(
          __dirname,
          "../../uploads/sessions",
          uploadSession.id,
          "chunks",
          String(chunk.chunkNumber)
        );
        chunkData = await fs.readFile(fallbackPath);
      }
      hash.update(chunkData);
      await fileHandle.write(chunkData);
    }
  } catch (err) {
    await fileHandle.close().catch(() => {});
    await fs.unlink(finalPath).catch(() => {});
    throw new AppError(`Failed to merge chunk files: ${err.message}`, 400);
  } finally {
    await fileHandle.close().catch(() => {});
  }

  const computedChecksum = hash.digest("hex");
  const expectedChecksum = clientChecksum || uploadSession.checksum;

  // Perform SHA-256 validation if checksum was provided
  if (expectedChecksum && computedChecksum.toLowerCase() !== expectedChecksum.toLowerCase()) {
    await fs.unlink(finalPath).catch(() => {});
    throw new AppError(
      `SHA-256 checksum mismatch. Expected ${expectedChecksum}, computed ${computedChecksum}`,
      400
    );
  }

  // Verify final file size
  const finalStats = await fs.stat(finalPath);

  if (finalStats.size !== uploadSession.totalSize) {
    await fs.unlink(finalPath).catch(() => {});
    throw new AppError("Final file size does not match expected size", 500);
  }

  const storageKey = `users/${ownerId}/files/${uploadSession.id}/${uploadSession.originalName}`;

  await uploadToS3({
    key: storageKey,
    body: await fs.readFile(finalPath),
    contentType: uploadSession.mimeType,
  });

  // Create final File record
  const file = await uploadRepository.createFile({
    originalName: uploadSession.originalName,
    storedName,
    mimeType: uploadSession.mimeType,
    size: finalStats.size,
    storageKey,
    ownerId,
    folderId: uploadSession.folderId,
  });

  await fs.unlink(finalPath).catch(() => {});

  // Delete upload session from DB (cascade-deletes all associated FileChunk DB records)
  await uploadRepository.deleteUploadSession(uploadSession.id);

  // Delete temporary chunks directory on disk
  const chunkDirectory = path.join(
    __dirname,
    "../../uploads/sessions",
    uploadSession.id
  );

  await fs.rm(chunkDirectory, {
    recursive: true,
    force: true,
  });

  return {
    ...file,
    sha256: computedChecksum,
  };
};

module.exports = {
  initUpload,
  uploadChunk,
  getUploadStatus,
  completeUpload,
};