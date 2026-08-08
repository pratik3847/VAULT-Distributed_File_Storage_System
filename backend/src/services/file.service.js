const fileRepository = require("../repositories/file.repository");
const localStorage = require("../storage/localStorage");
const AppError = require("../utils/appError");

const uploadFile = async (file, ownerId) => {
  if (!file) {
    throw new AppError("No file uploaded", 400);
  }

  const fileData = {
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    storagePath: file.path,
    ownerId,
  };

  const createdFile = await fileRepository.createFile(fileData);

  return createdFile;
};

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

  await localStorage.deleteFile(file.storagePath);

  return fileRepository.deleteFile(id);
};

module.exports = {
  uploadFile,
  getFiles,
  getFileById,
  deleteFile,
};