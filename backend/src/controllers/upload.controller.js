const uploadService = require("../services/upload.service");
const asyncHandler = require("../utils/asyncHandler");

const initUpload = asyncHandler(async (req, res) => {
  const upload = await uploadService.initUpload({
    ...req.body,
    ownerId: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: "Upload session initialized successfully",
    data: upload,
  });
});

const uploadChunk = asyncHandler(async (req, res) => {
  const chunk = await uploadService.uploadChunk({
    uploadId: req.params.uploadId,
    chunkNumber: req.body.chunkNumber,
    file: req.file,
    ownerId: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: "Chunk uploaded successfully",
    data: {
      chunkNumber: chunk.chunkNumber,
      size: chunk.size,
    },
  });
});

const getUploadStatus = asyncHandler(async (req, res) => {
  const status = await uploadService.getUploadStatus(
    req.params.uploadId,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: status,
  });
});

const completeUpload = asyncHandler(async (req, res) => {
  const file = await uploadService.completeUpload(
    req.params.uploadId,
    req.user.id
  );

  res.status(201).json({
    success: true,
    message: "Upload completed successfully",
    data: {
      fileId: file.id,
      originalName: file.originalName,
      size: file.size,
      mimeType: file.mimeType,
    },
  });
});

module.exports = {
  initUpload,
  uploadChunk,
  getUploadStatus,
  completeUpload,
};