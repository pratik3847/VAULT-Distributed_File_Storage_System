const prisma = require("../config/prisma");

const createUploadSession = async (data) => {
  return prisma.uploadSession.create({
    data,
  });
};

const findUploadSessionByIdAndOwner = async (id, ownerId) => {
  return prisma.uploadSession.findFirst({
    where: {
      id,
      ownerId,
    },
  });
};

const createFileChunk = async (data) => {
  return prisma.fileChunk.create({
    data,
  });
};

const findChunk = async (uploadSessionId, chunkNumber) => {
  return prisma.fileChunk.findUnique({
    where: {
      uploadSessionId_chunkNumber: {
        uploadSessionId,
        chunkNumber,
      },
    },
  });
};

const findUploadSessionWithChunks = async (id, ownerId) => {
  return prisma.uploadSession.findFirst({
    where: {
      id,
      ownerId,
    },
    include: {
      chunks: {
        orderBy: {
          chunkNumber: "asc",
        },
      },
    },
  });
};

const updateUploadSessionStatus = async (id, status) => {
  return prisma.uploadSession.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
};

const createFile = async (data) => {
  return prisma.file.create({
    data,
  });
};

const completeUploadSession = async (id) => {
  return prisma.uploadSession.update({
    where: {
      id,
    },
    data: {
      status: "COMPLETED",
    },
  });
};

module.exports = {
  createUploadSession,
  findUploadSessionByIdAndOwner,
  createFileChunk,
  findChunk,
  findUploadSessionWithChunks,
  updateUploadSessionStatus,
  createFile,
  completeUploadSession,
};