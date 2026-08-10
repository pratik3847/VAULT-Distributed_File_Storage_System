const express = require("express");

const router = express.Router();

const fileController = require("../controllers/file.controller");
const authMiddleware = require("../middleware/auth.middleware");

const validateParams = require("../middleware/validateParams.middleware");

const { fileIdSchema } = require("../validations/file.validation");

router.use(authMiddleware);



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