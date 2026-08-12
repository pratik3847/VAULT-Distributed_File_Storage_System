const uploadService = require("../services/upload.service");
const asyncHandler = require("../utils/asyncHandler");

const initUpload = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const idempotencyKey =
    req.headers["idempotency-key"] ||
    req.headers["x-idempotency-key"] ||
    body.idempotencyKey;

  const checksum =
    req.headers["x-checksum-sha256"] ||
    body.checksum;

  const upload = await uploadService.initUpload({
    ...body,
    ownerId: req.user.id,
    idempotencyKey,
    checksum,
  });

  const statusCode = upload.isExistingSession ? 200 : 201;

  res.status(statusCode).json({
    success: true,
    message: upload.isExistingSession
      ? "Existing active upload session returned"
      : "Upload session initialized successfully",
    data: upload,
  });
});

const uploadChunk = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const chunk = await uploadService.uploadChunk({
    uploadId: req.params.uploadId,
    chunkNumber: Number(body.chunkNumber),
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
  const body = req.body || {};
  const clientChecksum =
    req.headers["x-checksum-sha256"] ||
    body.checksum;

  const file = await uploadService.completeUpload(
    req.params.uploadId,
    req.user.id,
    clientChecksum
  );

  res.status(201).json({
    success: true,
    message: "Upload completed successfully",
    data: {
      fileId: file.id,
      originalName: file.originalName,
      size: file.size,
      mimeType: file.mimeType,
      sha256: file.sha256,
    },
  });
});

module.exports = {
  initUpload,
  uploadChunk,
  getUploadStatus,
  completeUpload,
};