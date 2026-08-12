const fileRepository = require("../repositories/file.repository");
const AppError = require("../utils/appError");

function authorizeFileAccess(requiredPermission = "VIEWER") {
  return async (req, res, next) => {
    try {
      const fileId = req.params.id || req.body.fileId;
      const userId = req.user?.id;

      if (!fileId) {
        return next(new AppError("File ID is required", 400));
      }

      if (!userId) {
        return next(new AppError("Unauthorized access", 401));
      }

      // 1. Check if user is owner
      const file = await fileRepository.findById(fileId);
      if (!file) {
        return next(new AppError("File not found", 404));
      }

      if (file.ownerId === userId) {
        req.fileRecord = file;
        req.userPermission = "OWNER";
        return next();
      }

      // 2. Check if user has permission
      const sharePermission = await fileRepository.findSharePermission(fileId, userId);
      if (!sharePermission) {
        return next(new AppError("Access denied to this file", 403));
      }

      // 3. Verify required permission level
      if (requiredPermission === "EDITOR" && sharePermission.permission !== "EDITOR") {
        return next(new AppError("Editor permission required for this operation", 403));
      }

      req.fileRecord = file;
      req.userPermission = sharePermission.permission;
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = authorizeFileAccess;
