const express = require("express");

const router = express.Router();

const uploadController = require("../controllers/upload.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const validateParams = require("../middleware/validateParams.middleware");

const chunkUpload = require("../middleware/chunkUpload.middleware");

const {
  initUploadSchema,
  chunkParamsSchema,
  chunkBodySchema,
} = require("../validations/upload.validation");

router.use(authMiddleware);

router.post(
  "/init",
  validate(initUploadSchema),
  uploadController.initUpload
);

router.post(
  "/:uploadId/chunk",
  validateParams(chunkParamsSchema),
  chunkUpload.single("chunk"),
  validate(chunkBodySchema),
  uploadController.uploadChunk
);

router.get(
  "/:uploadId/status",
  validateParams(chunkParamsSchema),
  uploadController.getUploadStatus
);

router.post(
  "/:uploadId/complete",
  validateParams(chunkParamsSchema),
  uploadController.completeUpload
);

module.exports = router;