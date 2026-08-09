const uploadRepository = require("../repositories/upload.repository");

const CHUNK_SIZE = 5 * 1024 * 1024;

const initUpload = async ({
  originalName,
  mimeType,
  totalSize,
  ownerId,
}) => {
  const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);

  const uploadSession = await uploadRepository.createUploadSession({
    originalName,
    mimeType,
    totalSize,
    chunkSize: CHUNK_SIZE,
    totalChunks,
    ownerId,
  });

  return {
    uploadId: uploadSession.id,
    chunkSize: uploadSession.chunkSize,
    totalChunks: uploadSession.totalChunks,
  };
};

module.exports = {
  initUpload,
};