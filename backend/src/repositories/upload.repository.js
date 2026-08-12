const prisma = require("../config/prisma");

const createUploadSession = async (data) => {
  return prisma.uploadSession.create({
    data,
  });
};

const findActiveSessionByIdempotencyKey = async (ownerId, idempotencyKey) => {
  if (!idempotencyKey) return null;
  return prisma.uploadSession.findFirst({
    where: {
      ownerId,
      idempotencyKey,
      status: {
        in: ["INITIATED", "UPLOADING"],
      },
    },
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

const findAbandonedSessions = async (olderThanDate) => {
  return prisma.uploadSession.findMany({
    where: {
      status: {
        in: ["INITIATED", "UPLOADING"],
      },
      createdAt: {
        lt: olderThanDate,
      },
    },
  });
};

const deleteUploadSession = async (id) => {
  return prisma.uploadSession.delete({
    where: { id },
  });
};

module.exports = {
  createUploadSession,
  findActiveSessionByIdempotencyKey,
  findUploadSessionByIdAndOwner,
  createFileChunk,
  findChunk,
  findUploadSessionWithChunks,
  updateUploadSessionStatus,
  createFile,
  completeUploadSession,
  findAbandonedSessions,
  deleteUploadSession,
};