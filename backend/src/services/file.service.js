const fileRepository = require("../repositories/file.repository");
const AppError = require("../utils/appError");
const { deleteFromS3 } = require("./storage.service");



const getFiles = async (ownerId) => {
  return await fileRepository.findByOwner(ownerId);
};

const getFileById = async (id, ownerId) => {
  const file = await fileRepository.findByIdAndOwner(id, ownerId);

  if (!file) {
    throw new AppError("File not found", 404);
  }

  return file;
};

const deleteFile = async (id, ownerId) => {
  const file = await getFileById(id, ownerId);

  await deleteFromS3(file.storageKey);

  return fileRepository.deleteFile(id);
};

module.exports = {
 
  getFiles,
  getFileById,
  deleteFile,
};