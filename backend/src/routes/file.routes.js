const express = require("express");

const router = express.Router();

const fileController = require("../controllers/file.controller");
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const validateParams = require("../middleware/validateParams.middleware");

const { fileIdSchema } = require("../validations/file.validation");

router.use(authMiddleware);

router.post(
  "/upload",
  upload.single("file"),
  fileController.uploadFile
);

router.get(
  "/",
  fileController.getFiles
);

router.get(
  "/:id/download",
  validateParams(fileIdSchema),
  fileController.downloadFile
);

router.get(
  "/:id",
  validateParams(fileIdSchema),
  fileController.getFile
);

router.delete(
  "/:id",
  validateParams(fileIdSchema),
  fileController.deleteFile
);

module.exports = router;