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

module.exports = {
  createUploadSession,
  findUploadSessionByIdAndOwner,
};