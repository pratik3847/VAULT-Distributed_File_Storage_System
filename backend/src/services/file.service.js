const fileRepository = require("../repositories/file.repository");
const folderRepository = require("../repositories/folder.repository");
const userRepository = require("../repositories/user.repository");
const AppError = require("../utils/appError");
const { deleteFromS3 } = require("./storage.service");

const getFiles = async (ownerId) => {
  return await fileRepository.findByOwner(ownerId);
};

const getFileById = async (id, userId) => {
  const fileWithAccess = await fileRepository.findByIdWithPermission(id, userId);

  if (!fileWithAccess) {
    // Check if file exists at all to return 404 vs 403
    const exists = await fileRepository.findById(id);
    if (!exists) {
      throw new AppError("File not found", 404);
    }
    throw new AppError("Access forbidden: You do not have permission to view this file", 403);
  }

  return fileWithAccess;
};

const moveFile = async ({ id, targetFolderId, userId }) => {
  const fileWithAccess = await fileRepository.findByIdWithPermission(id, userId);

  if (!fileWithAccess) {
    throw new AppError("File not found", 404);
  }

  // Only Owner or EDITOR can move file
  if (!fileWithAccess.isOwner && fileWithAccess.userPermission !== "EDITOR") {
    throw new AppError("Access forbidden: Viewer permission does not allow moving files", 403);
  }

  if (targetFolderId) {
    const targetFolder = await folderRepository.findByIdAndOwner(targetFolderId, userId);
    if (!targetFolder) {
      throw new AppError("Target folder not found", 404);
    }
  }

  return fileRepository.updateFile(id, {
    folderId: targetFolderId || null,
  });
};

const updateFileDetails = async ({ id, name, userId }) => {
  const fileWithAccess = await fileRepository.findByIdWithPermission(id, userId);

  if (!fileWithAccess) {
    throw new AppError("File not found", 404);
  }

  // Only Owner or EDITOR can rename file
  if (!fileWithAccess.isOwner && fileWithAccess.userPermission !== "EDITOR") {
    throw new AppError("Access forbidden: Viewer permission does not allow renaming files", 403);
  }

  return fileRepository.updateFile(id, {
    originalName: name,
  });
};

const toggleStarFile = async (id, ownerId) => {
  const file = await fileRepository.findByIdAndOwner(id, ownerId);
  if (!file) {
    throw new AppError("File not found", 404);
  }

  return fileRepository.updateFile(id, {
    isStarred: !file.isStarred,
  });
};

const trashFile = async (id, ownerId) => {
  const file = await fileRepository.findByIdAndOwner(id, ownerId);
  if (!file) {
    throw new AppError("File not found", 404);
  }

  return fileRepository.updateFile(id, {
    isTrashed: true,
  });
};

const restoreFile = async (id, ownerId) => {
  const file = await fileRepository.findByIdAndOwner(id, ownerId);
  if (!file) {
    throw new AppError("File not found", 404);
  }

  return fileRepository.updateFile(id, {
    isTrashed: false,
  });
};

const deleteFile = async (id, ownerId) => {
  const file = await fileRepository.findByIdAndOwner(id, ownerId);
  if (!file) {
    throw new AppError("File not found or forbidden", 404);
  }

  await deleteFromS3(file.storageKey);
  return fileRepository.deleteFile(id);
};

// File Sharing Functions
const shareFile = async ({ fileId, ownerId, targetUserId, permission }) => {
  // 1. Verify file exists
  const file = await fileRepository.findByIdAndOwner(fileId, ownerId);
  if (!file) {
    throw new AppError("File not found", 404);
  }

  // 2. Prevent self-share
  if (targetUserId === ownerId) {
    throw new AppError("You cannot share a file with yourself", 400);
  }

  // 3. Verify target user exists
  const targetUser = await userRepository.findById(targetUserId);
  if (!targetUser) {
    throw new AppError("Target user not found", 404);
  }

  // 4. Validate permission enum
  const validPermissions = ["VIEWER", "EDITOR"];
  const formattedPermission = permission ? permission.toUpperCase() : "VIEWER";
  if (!validPermissions.includes(formattedPermission)) {
    throw new AppError("Invalid permission level. Must be VIEWER or EDITOR.", 400);
  }

  // 5. Prevent duplicate share
  const existingShare = await fileRepository.findSharePermission(fileId, targetUserId);
  if (existingShare) {
    throw new AppError("File is already shared with this user", 409);
  }

  // 6. Create share permission
  return fileRepository.createSharePermission({
    fileId,
    userId: targetUserId,
    sharedById: ownerId,
    permission: formattedPermission,
  });
};

const getSharedWithMeFiles = async (userId) => {
  return fileRepository.findSharedWithMeFiles(userId);
};

const getFileShares = async ({ fileId, ownerId }) => {
  const file = await fileRepository.findByIdAndOwner(fileId, ownerId);
  if (!file) {
    return [];
  }

  return fileRepository.findFileShares(fileId);
};

const unshareFile = async ({ fileId, ownerId, targetUserId }) => {
  const file = await fileRepository.findByIdAndOwner(fileId, ownerId);
  if (!file) {
    throw new AppError("File not found or forbidden", 404);
  }

  const existingShare = await fileRepository.findSharePermission(fileId, targetUserId);
  if (!existingShare) {
    throw new AppError("Share record not found for this user", 404);
  }

  return fileRepository.deleteSharePermission(fileId, targetUserId);
};

const updateSharePermission = async ({ fileId, ownerId, targetUserId, permission }) => {
  const file = await fileRepository.findByIdAndOwner(fileId, ownerId);
  if (!file) {
    throw new AppError("File not found or forbidden", 404);
  }

  const validPermissions = ["VIEWER", "EDITOR"];
  const formattedPermission = permission ? permission.toUpperCase() : "VIEWER";
  if (!validPermissions.includes(formattedPermission)) {
    throw new AppError("Invalid permission level. Must be VIEWER or EDITOR.", 400);
  }

  const existingShare = await fileRepository.findSharePermission(fileId, targetUserId);
  if (!existingShare) {
    throw new AppError("Share record not found for this user", 404);
  }

  return fileRepository.updateSharePermission(fileId, targetUserId, formattedPermission);
};

// Batch operations
const batchDelete = async ({ fileIds = [], folderIds = [], ownerId }) => {
  const folderService = require("./folder.service");

  // Delete files
  for (const fileId of fileIds) {
    try {
      await deleteFile(fileId, ownerId);
    } catch (err) {
      console.error(`Batch delete file ${fileId} failed:`, err.message);
    }
  }

  // Delete folders recursively
  for (const folderId of folderIds) {
    try {
      await folderService.deleteFolder(folderId, ownerId);
    } catch (err) {
      console.error(`Batch delete folder ${folderId} failed:`, err.message);
    }
  }

  return { success: true };
};

const batchMove = async ({ fileIds = [], folderIds = [], targetFolderId, ownerId }) => {
  const folderService = require("./folder.service");

  for (const fileId of fileIds) {
    await moveFile({ id: fileId, targetFolderId, userId: ownerId });
  }

  for (const folderId of folderIds) {
    await folderService.moveFolder({ id: folderId, targetParentId: targetFolderId, ownerId });
  }

  return { success: true };
};

const getStarredFiles = async (ownerId) => {
  return fileRepository.findStarredFiles(ownerId);
};

const getTrashedFiles = async (ownerId) => {
  return fileRepository.findTrashedFiles(ownerId);
};

module.exports = {
  getFiles,
  getFileById,
  moveFile,
  updateFileDetails,
  toggleStarFile,
  trashFile,
  restoreFile,
  deleteFile,
  shareFile,
  getSharedWithMeFiles,
  getFileShares,
  unshareFile,
  updateSharePermission,
  batchDelete,
  batchMove,
  getStarredFiles,
  getTrashedFiles,
};