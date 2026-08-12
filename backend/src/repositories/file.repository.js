const prisma = require("../config/prisma");

const createFile = async (data) => {
  return prisma.file.create({
    data,
  });
};

const findById = async (id) => {
  return prisma.file.findUnique({
    where: { id },
  });
};

const findByIdAndOwner = async (id, ownerId) => {
  return prisma.file.findFirst({
    where: {
      id,
      ownerId,
    },
  });
};

const findByIdWithPermission = async (id, userId) => {
  // Return file if user is owner OR has a FilePermission entry
  const file = await prisma.file.findFirst({
    where: {
      id,
      OR: [
        { ownerId: userId },
        { permissions: { some: { userId } } },
      ],
    },
    include: {
      permissions: {
        where: { userId },
      },
    },
  });

  if (!file) return null;

  const isOwner = file.ownerId === userId;
  const userPermission = isOwner
    ? "OWNER"
    : file.permissions[0]?.permission || null;

  return {
    ...file,
    isOwner,
    userPermission,
  };
};

const findByOwner = async (ownerId) => {
  return prisma.file.findMany({
    where: { ownerId, isTrashed: false },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const updateFile = async (id, data) => {
  return prisma.file.update({
    where: { id },
    data,
  });
};

const deleteFile = async (id) => {
  return prisma.file.delete({
    where: { id },
  });
};

const deleteManyFiles = async (ids) => {
  return prisma.file.deleteMany({
    where: { id: { in: ids } },
  });
};

// File Permission & Sharing Queries
const findSharePermission = async (fileId, userId) => {
  return prisma.filePermission.findUnique({
    where: {
      fileId_userId: {
        fileId,
        userId,
      },
    },
  });
};

const createSharePermission = async ({ fileId, userId, sharedById, permission }) => {
  return prisma.filePermission.create({
    data: {
      fileId,
      userId,
      sharedById,
      permission,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

const updateSharePermission = async (fileId, userId, permission) => {
  return prisma.filePermission.update({
    where: {
      fileId_userId: {
        fileId,
        userId,
      },
    },
    data: {
      permission,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

const deleteSharePermission = async (fileId, userId) => {
  return prisma.filePermission.delete({
    where: {
      fileId_userId: {
        fileId,
        userId,
      },
    },
  });
};

const findSharedWithMeFiles = async (userId) => {
  const permissions = await prisma.filePermission.findMany({
    where: {
      userId,
      sharedById: { not: userId },
      file: {
        isTrashed: false,
        ownerId: { not: userId },
      },
    },
    include: {
      file: true,
      sharedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return permissions.map((p) => ({
    fileId: p.file.id,
    name: p.file.originalName,
    size: p.file.size,
    mimeType: p.file.mimeType,
    updatedAt: p.file.updatedAt,
    createdAt: p.file.createdAt,
    permission: p.permission,
    sharedBy: p.sharedBy,
    file: p.file,
  }));
};

const findFileShares = async (fileId) => {
  return prisma.filePermission.findMany({
    where: { fileId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

const findStarredFiles = async (ownerId) => {
  return prisma.file.findMany({
    where: {
      ownerId,
      isStarred: true,
      isTrashed: false,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

const findTrashedFiles = async (ownerId) => {
  return prisma.file.findMany({
    where: {
      ownerId,
      isTrashed: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

module.exports = {
  createFile,
  findById,
  findByIdAndOwner,
  findByIdWithPermission,
  findByOwner,
  updateFile,
  deleteFile,
  deleteManyFiles,
  findSharePermission,
  createSharePermission,
  updateSharePermission,
  deleteSharePermission,
  findSharedWithMeFiles,
  findFileShares,
  findStarredFiles,
  findTrashedFiles,
};