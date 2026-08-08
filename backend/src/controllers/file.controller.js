const fileService = require("../services/file.service");
const asyncHandler = require("../utils/asyncHandler");

const uploadFile = asyncHandler(async (req, res) => {
  const file = await fileService.uploadFile(req.file, req.user.id);

  res.status(201).json({
    success: true,
    message: "File uploaded successfully",
    data: file,
  });
});

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

  return res.download(file.storagePath, file.originalName);
});

const deleteFile = asyncHandler(async (req, res) => {
  await fileService.deleteFile(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: "File deleted successfully",
  });
});

module.exports = {
  uploadFile,
  getFiles,
  getFile,
  downloadFile,
  deleteFile,
};