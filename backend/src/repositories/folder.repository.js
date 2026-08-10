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
        orderBy: {
          name: "asc",
        },
      },
      files: {
        orderBy: {
          originalName: "asc",
        },
      },
    },
  });
};

const findChildFolderByName = async ({
  name,
  ownerId,
  parentId,
}) => {
  return prisma.folder.findFirst({
    where: {
      name,
      ownerId,
      parentId,
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

module.exports = {
  createFolder,
  findByIdAndOwner,
  findRootFolders,
  findFolderWithContents,
  findChildFolderByName,
  updateFolder,
  deleteFolder,
  findParentFolder,
};