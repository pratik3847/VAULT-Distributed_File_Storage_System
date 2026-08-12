const prisma = require("../config/prisma");

const createFolder = async (data) => {
  return prisma.folder.create({
    data,
  });
};

const findByIdAndOwner = async (id, ownerId) => {
  return prisma.folder.findFirst({
    where: {
      id,
      ownerId,
    },
  });
};

const findRootFolders = async (ownerId) => {
  return prisma.folder.findMany({
    where: {
      ownerId,
      parentId: null,
      isTrashed: false,
    },
    include: {
      _count: {
        select: {
          children: true,
          files: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
};

const findFolderWithContents = async (id, ownerId) => {
  return prisma.folder.findFirst({
    where: {
      id,
      ownerId,
    },
    include: {
      children: {
        where: { isTrashed: false },
        include: {
          _count: {
            select: {
              children: true,
              files: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      },
      files: {
        where: { isTrashed: false },
        orderBy: {
          originalName: "asc",
        },
      },
    },
  });
};

const findChildFolderByName = async ({ name, ownerId, parentId }) => {
  return prisma.folder.findFirst({
    where: {
      name,
      ownerId,
      parentId,
      isTrashed: false,
    },
  });
};

const updateFolder = async (id, data) => {
  return prisma.folder.update({
    where: {
      id,
    },
    data,
  });
};

const deleteFolder = async (id) => {
  return prisma.folder.delete({
    where: {
      id,
    },
  });
};

const findParentFolder = async (id, ownerId) => {
  return prisma.folder.findFirst({
    where: {
      id,
      ownerId,
    },
  });
};

// Helper: Recursively get all descendant folder IDs
const getAllDescendantFolderIds = async (folderId, ownerId) => {
  const descendantIds = [folderId];
  let queue = [folderId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    const children = await prisma.folder.findMany({
      where: {
        parentId: currentId,
        ownerId,
      },
      select: { id: true },
    });

    for (const child of children) {
      descendantIds.push(child.id);
      queue.push(child.id);
    }
  }

  return descendantIds;
};

// Helper: Get all files belonging to array of folder IDs
const getFilesByFolderIds = async (folderIds) => {
  return prisma.file.findMany({
    where: {
      folderId: { in: folderIds },
    },
  });
};

const findStarredFolders = async (ownerId) => {
  return prisma.folder.findMany({
    where: {
      ownerId,
      isStarred: true,
      isTrashed: false,
    },
    include: {
      _count: {
        select: {
          children: true,
          files: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

const findTrashedFolders = async (ownerId) => {
  return prisma.folder.findMany({
    where: {
      ownerId,
      isTrashed: true,
    },
    include: {
      _count: {
        select: {
          children: true,
          files: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

module.exports = {
  createFolder,
  findByIdAndOwner,
  findRootFolders,
  findFolderWithContents,
  findChildFolderByName,
  updateFolder,
  deleteFolder,
  findParentFolder,
  getAllDescendantFolderIds,
  getFilesByFolderIds,
  findStarredFolders,
  findTrashedFolders,
};