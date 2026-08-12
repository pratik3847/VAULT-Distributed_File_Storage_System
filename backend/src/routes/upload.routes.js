const express = require("express");

const router = express.Router();

const uploadController = require("../controllers/upload.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const chunkUpload = require("../middleware/chunkUpload.middleware");
const { uploadLimiter } = require("../middleware/rateLimit.middleware");

const {
  initUploadSchema,
} = require("../validations/upload.validation");

router.use(authMiddleware);
router.use(uploadLimiter);

router.post(
  "/init",
  validate(initUploadSchema),
  uploadController.initUpload
);

router.post(
  "/:uploadId/chunk",
  chunkUpload.single("chunk"),
  uploadController.uploadChunk
);

router.get(
  "/:uploadId/status",
  uploadController.getUploadStatus
);

router.post(
  "/:uploadId/complete",
  uploadController.completeUpload
);

module.exports = router;