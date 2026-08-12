const express = require("express");

const router = express.Router();

const fileController = require("../controllers/file.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validateParams = require("../middleware/validateParams.middleware");
const { fileIdSchema } = require("../validations/file.validation");

router.use(authMiddleware);

// Base file lists
router.get("/", fileController.getFiles);
router.get("/shared-with-me", fileController.getSharedWithMe);
router.get("/starred", fileController.getStarred);
router.get("/trashed", fileController.getTrashed);

// Batch operations
router.post("/batch-delete", fileController.batchDelete);
router.post("/batch-move", fileController.batchMove);

// Single file operations
router.get("/:id/download", validateParams(fileIdSchema), fileController.downloadFile);

// Sharing endpoints
router.post("/:id/share", validateParams(fileIdSchema), fileController.shareFile);
router.get("/:id/shares", validateParams(fileIdSchema), fileController.getFileShares);
router.patch("/:id/share/:userId", validateParams(fileIdSchema), fileController.updateSharePermission);
router.delete("/:id/share/:userId", validateParams(fileIdSchema), fileController.unshareFile);

// Item modifications
router.patch("/:id/move", validateParams(fileIdSchema), fileController.moveFile);
router.patch("/:id/star", validateParams(fileIdSchema), fileController.toggleStarFile);
router.patch("/:id/trash", validateParams(fileIdSchema), fileController.trashFile);
router.patch("/:id/restore", validateParams(fileIdSchema), fileController.restoreFile);
router.patch("/:id", validateParams(fileIdSchema), fileController.renameFile);

router.get("/:id", validateParams(fileIdSchema), fileController.getFile);
router.delete("/:id", validateParams(fileIdSchema), fileController.deleteFile);

module.exports = router;