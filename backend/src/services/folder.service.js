const folderRepository = require("../repositories/folder.repository");
const AppError = require("../utils/appError");

const createFolder = async ({
  name,
  parentId,
  ownerId,
}) => {
  // If creating inside another folder,
  // verify that the parent belongs to the current user.
  if (parentId) {
    const parentFolder =
      await folderRepository.findParentFolder(
        parentId,
        ownerId
      );

    if (!parentFolder) {
      throw new AppError(
        "Parent folder not found",
        404
      );
    }
  }

  // Prevent duplicate folder names
  // inside the same parent.
  const existingFolder =
    await folderRepository.findChildFolderByName({
      name,
      ownerId,
      parentId: parentId || null,
    });

  if (existingFolder) {
    throw new AppError(
      "A folder with this name already exists here",
      409
    );
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
  const folder =
    await folderRepository.findFolderWithContents(
      id,
      ownerId
    );

  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  return folder;
};

const updateFolder = async ({
  id,
  name,
  ownerId,
}) => {
  const folder =
    await folderRepository.findByIdAndOwner(
      id,
      ownerId
    );

  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  const existingFolder =
    await folderRepository.findChildFolderByName({
      name,
      ownerId,
      parentId: folder.parentId,
    });

  if (
    existingFolder &&
    existingFolder.id !== id
  ) {
    throw new AppError(
      "A folder with this name already exists here",
      409
    );
  }

  return folderRepository.updateFolder(id, {
    name,
  });
};

const deleteFolder = async (id, ownerId) => {
  const folder =
    await folderRepository.findByIdAndOwner(
      id,
      ownerId
    );

  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  /*
   * Prisma relation behavior:
   *
   * Folder children:
   * onDelete: Cascade
   *
   * Files:
   * onDelete: SetNull
   *
   * Therefore:
   * - child folders are deleted
   * - files become root-level files
   */
  return folderRepository.deleteFolder(id);
};

module.exports = {
  createFolder,
  getRootFolders,
  getFolderById,
  updateFolder,
  deleteFolder,
};