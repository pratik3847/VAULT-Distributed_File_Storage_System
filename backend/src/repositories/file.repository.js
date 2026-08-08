const prisma = require("../config/prisma");

const createFile = async (data) => {
  return prisma.file.create({
    data,
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

const findByOwner = async (ownerId) => {
  return prisma.file.findMany({
    where: { ownerId },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const deleteFile = async (id) => {
  return prisma.file.delete({
    where: { id },
  });
};

module.exports = {
  createFile,
  findByIdAndOwner,
  findByOwner,
  deleteFile,
};