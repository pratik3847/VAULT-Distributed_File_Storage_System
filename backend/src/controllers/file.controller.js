const fileService = require("../services/file.service");
const folderService = require("../services/folder.service");
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

const moveFile = asyncHandler(async (req, res) => {
  const updated = await fileService.moveFile({
    id: req.params.id,
    targetFolderId: req.body.targetFolderId ?? null,
    userId: req.user.id,
  });

  res.status(200).json({
    success: true,
    message: "File moved successfully",
    data: updated,
  });
});

const renameFile = asyncHandler(async (req, res) => {
  const updated = await fileService.updateFileDetails({
    id: req.params.id,
    name: req.body.name,
    userId: req.user.id,
  });

  res.status(200).json({
    success: true,
    message: "File renamed successfully",
    data: updated,
  });
});

const toggleStarFile = asyncHandler(async (req, res) => {
  const updated = await fileService.toggleStarFile(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: updated.isStarred ? "File starred" : "File unstarred",
    data: updated,
  });
});

const trashFile = asyncHandler(async (req, res) => {
  const updated = await fileService.trashFile(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: "File moved to trash",
    data: updated,
  });
});

const restoreFile = asyncHandler(async (req, res) => {
  const updated = await fileService.restoreFile(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: "File restored",
    data: updated,
  });
});

// Sharing Controllers
const shareFile = asyncHandler(async (req, res) => {
  const share = await fileService.shareFile({
    fileId: req.params.id,
    ownerId: req.user.id,
    targetUserId: req.body.userId,
    permission: req.body.permission,
  });

  res.status(201).json({
    success: true,
    message: "File shared successfully",
    data: share,
  });
});

const getSharedWithMe = asyncHandler(async (req, res) => {
  const files = await fileService.getSharedWithMeFiles(req.user.id);

  res.status(200).json({
    success: true,
    data: files,
  });
});

const getFileShares = asyncHandler(async (req, res) => {
  const shares = await fileService.getFileShares({
    fileId: req.params.id,
    ownerId: req.user.id,
  });

  res.status(200).json({
    success: true,
    data: shares,
  });
});

const unshareFile = asyncHandler(async (req, res) => {
  await fileService.unshareFile({
    fileId: req.params.id,
    ownerId: req.user.id,
    targetUserId: req.params.userId,
  });

  res.status(200).json({
    success: true,
    message: "User access revoked",
  });
});

const updateSharePermission = asyncHandler(async (req, res) => {
  const updated = await fileService.updateSharePermission({
    fileId: req.params.id,
    ownerId: req.user.id,
    targetUserId: req.params.userId,
    permission: req.body.permission,
  });

  res.status(200).json({
    success: true,
    message: "Permission updated successfully",
    data: updated,
  });
});

const batchDelete = asyncHandler(async (req, res) => {
  const result = await fileService.batchDelete({
    fileIds: req.body.fileIds || [],
    folderIds: req.body.folderIds || [],
    ownerId: req.user.id,
  });

  res.status(200).json({
    success: true,
    message: "Batch delete successful",
    data: result,
  });
});

const batchMove = asyncHandler(async (req, res) => {
  const result = await fileService.batchMove({
    fileIds: req.body.fileIds || [],
    folderIds: req.body.folderIds || [],
    targetFolderId: req.body.targetFolderId ?? null,
    ownerId: req.user.id,
  });

  res.status(200).json({
    success: true,
    message: "Batch move successful",
    data: result,
  });
});

const getStarred = asyncHandler(async (req, res) => {
  const files = await fileService.getStarredFiles(req.user.id);
  const folders = await folderService.getStarredFolders(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      files,
      folders,
    },
  });
});

const getTrashed = asyncHandler(async (req, res) => {
  const files = await fileService.getTrashedFiles(req.user.id);
  const folders = await folderService.getTrashedFolders(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      files,
      folders,
    },
  });
});

module.exports = {
  getFiles,
  getFile,
  downloadFile,
  deleteFile,
  moveFile,
  renameFile,
  toggleStarFile,
  trashFile,
  restoreFile,
  shareFile,
  getSharedWithMe,
  getFileShares,
  unshareFile,
  updateSharePermission,
  batchDelete,
  batchMove,
  getStarred,
  getTrashed,
};