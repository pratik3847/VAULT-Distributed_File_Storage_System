const folderService = require("../services/folder.service");
const asyncHandler = require("../utils/asyncHandler");

const createFolder = asyncHandler(async (req, res) => {
  const folder = await folderService.createFolder({
    name: req.body.name,
    parentId: req.body.parentId,
    ownerId: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: "Folder created successfully",
    data: folder,
  });
});

const getRootFolders = asyncHandler(async (req, res) => {
  const folders = await folderService.getRootFolders(
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: folders,
  });
});

const getFolder = asyncHandler(async (req, res) => {
  const folder = await folderService.getFolderById(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: folder,
  });
});

const updateFolder = asyncHandler(async (req, res) => {
  const folder = await folderService.updateFolder({
    id: req.params.id,
    name: req.body.name,
    ownerId: req.user.id,
  });

  res.status(200).json({
    success: true,
    message: "Folder updated successfully",
    data: folder,
  });
});

const moveFolder = asyncHandler(async (req, res) => {
  const folder = await folderService.moveFolder({
    id: req.params.id,
    targetParentId: req.body.parentId ?? null,
    ownerId: req.user.id,
  });

  res.status(200).json({
    success: true,
    message: "Folder moved successfully",
    data: folder,
  });
});

const toggleStarFolder = asyncHandler(async (req, res) => {
  const folder = await folderService.toggleStarFolder(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: folder.isStarred ? "Folder starred" : "Folder unstarred",
    data: folder,
  });
});

const trashFolder = asyncHandler(async (req, res) => {
  const folder = await folderService.trashFolder(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: "Folder moved to trash",
    data: folder,
  });
});

const restoreFolder = asyncHandler(async (req, res) => {
  const folder = await folderService.restoreFolder(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: "Folder restored",
    data: folder,
  });
});

const deleteFolder = asyncHandler(async (req, res) => {
  await folderService.deleteFolder(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: "Folder deleted successfully",
  });
});

module.exports = {
  createFolder,
  getRootFolders,
  getFolder,
  updateFolder,
  moveFolder,
  toggleStarFolder,
  trashFolder,
  restoreFolder,
  deleteFolder,
};