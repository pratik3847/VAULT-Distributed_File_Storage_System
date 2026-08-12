const folderRepository = require("../repositories/folder.repository");
const fileRepository = require("../repositories/file.repository");
const { deleteFromS3 } = require("./storage.service");
const AppError = require("../utils/appError");

const createFolder = async ({ name, parentId, ownerId }) => {
  if (parentId) {
    const parentFolder = await folderRepository.findParentFolder(parentId, ownerId);
    if (!parentFolder) {
      throw new AppError("Parent folder not found", 404);
    }
  }

  const existingFolder = await folderRepository.findChildFolderByName({
    name,
    ownerId,
    parentId: parentId || null,
  });

  if (existingFolder) {
    throw new AppError("A folder with this name already exists here", 409);
  }

  return folderRepository.createFolder({
    name,
    ownerId,
    parentId: parentId || null,
  });
};

const getRootFolders = async (ownerId) => {
  return folderRepository.findRootFolders(ownerId);
};

const getFolderById = async (id, ownerId) => {
  const folder = await folderRepository.findFolderWithContents(id, ownerId);
  if (!folder) {
    throw new AppError("Folder not found", 404);
  }
  return folder;
};

const updateFolder = async ({ id, name, ownerId }) => {
  const folder = await folderRepository.findByIdAndOwner(id, ownerId);
  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  const existingFolder = await folderRepository.findChildFolderByName({
    name,
    ownerId,
    parentId: folder.parentId,
  });

  if (existingFolder && existingFolder.id !== id) {
    throw new AppError("A folder with this name already exists here", 409);
  }

  return folderRepository.updateFolder(id, { name });
};

const moveFolder = async ({ id, targetParentId, ownerId }) => {
  const folder = await folderRepository.findByIdAndOwner(id, ownerId);
  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  if (targetParentId === id) {
    throw new AppError("Cannot move a folder into itself", 400);
  }

  if (targetParentId) {
    const targetParent = await folderRepository.findByIdAndOwner(targetParentId, ownerId);
    if (!targetParent) {
      throw new AppError("Target destination folder not found", 404);
    }

    // Check circular reference (prevent moving folder into one of its own descendants)
    const descendantIds = await folderRepository.getAllDescendantFolderIds(id, ownerId);
    if (descendantIds.includes(targetParentId)) {
      throw new AppError("Cannot move a folder into one of its subfolders", 400);
    }
  }

  return folderRepository.updateFolder(id, {
    parentId: targetParentId || null,
  });
};

const toggleStarFolder = async (id, ownerId) => {
  const folder = await folderRepository.findByIdAndOwner(id, ownerId);
  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  return folderRepository.updateFolder(id, {
    isStarred: !folder.isStarred,
  });
};

const trashFolder = async (id, ownerId) => {
  const folder = await folderRepository.findByIdAndOwner(id, ownerId);
  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  return folderRepository.updateFolder(id, {
    isTrashed: true,
  });
};

const restoreFolder = async (id, ownerId) => {
  const folder = await folderRepository.findByIdAndOwner(id, ownerId);
  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  return folderRepository.updateFolder(id, {
    isTrashed: false,
  });
};

const deleteFolder = async (id, ownerId) => {
  const folder = await folderRepository.findByIdAndOwner(id, ownerId);
  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  // 1. Recursively find all descendant folder IDs (including target folder)
  const allFolderIds = await folderRepository.getAllDescendantFolderIds(id, ownerId);

  // 2. Find all nested files in those folders
  const nestedFiles = await folderRepository.getFilesByFolderIds(allFolderIds);

  // 3. Delete files from S3 physical storage
  for (const file of nestedFiles) {
    try {
      await deleteFromS3(file.storageKey);
    } catch (s3Err) {
      console.error(`Failed to delete S3 key ${file.storageKey}:`, s3Err.message);
    }
  }

  // 4. Delete nested file records from DB
  if (nestedFiles.length > 0) {
    const fileIds = nestedFiles.map((f) => f.id);
    await fileRepository.deleteManyFiles(fileIds);
  }

  // 5. Delete folder (Prisma onDelete: Cascade will delete child folders)
  return folderRepository.deleteFolder(id);
};

const getStarredFolders = async (ownerId) => {
  return folderRepository.findStarredFolders(ownerId);
};

const getTrashedFolders = async (ownerId) => {
  return folderRepository.findTrashedFolders(ownerId);
};

module.exports = {
  createFolder,
  getRootFolders,
  getFolderById,
  updateFolder,
  moveFolder,
  toggleStarFolder,
  trashFolder,
  restoreFolder,
  deleteFolder,
  getStarredFolders,
  getTrashedFolders,
};