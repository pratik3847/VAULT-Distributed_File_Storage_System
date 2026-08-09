const express = require("express");

const router = express.Router();

const uploadController = require("../controllers/upload.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const {
  initUploadSchema,
} = require("../validations/upload.validation");

router.use(authMiddleware);

router.post(
  "/init",
  validate(initUploadSchema),
  uploadController.initUpload
);

module.exports = router;