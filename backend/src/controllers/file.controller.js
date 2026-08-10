const fileService = require("../services/file.service");
const asyncHandler = require("../utils/asyncHandler");
const { getFromS3 } = require("../services/storage.service");



const getFiles = asyncHandler(async (req, res) => {
  const files = await fileService.getFiles(req.user.id);

  res.status(200).json({
    success: true,
    data: files,
  });
});

const getFile = asyncHandler(async (req, res) => {
  const file = await fileService.getFileById(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: file,
  });
});

const downloadFile = asyncHandler(async (req, res) => {
  const file = await fileService.getFileById(
    req.params.id,
    req.user.id
  );

  const fileStream = await getFromS3(file.storageKey);

  res.setHeader("Content-Type", file.mimeType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${file.originalName}"`
  );

  return fileStream.pipe(res);
});

const deleteFile = asyncHandler(async (req, res) => {
  await fileService.deleteFile(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: "File deleted successfully",
  });
});

module.exports = {
  
  getFiles,
  getFile,
  downloadFile,
  deleteFile,
};