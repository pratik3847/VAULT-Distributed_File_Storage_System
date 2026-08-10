const express = require("express");

const router = express.Router();

const folderController = require("../controllers/folder.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const validateParams = require("../middleware/validateParams.middleware");

const {
  createFolderSchema,
  updateFolderSchema,
  folderIdSchema,
} = require("../validations/folder.validation");

router.use(authMiddleware);

router.post(
  "/",
  validate(createFolderSchema),
  folderController.createFolder
);

router.get(
  "/",
  folderController.getRootFolders
);

router.get(
  "/:id",
  validateParams(folderIdSchema),
  folderController.getFolder
);

router.patch(
  "/:id",
  validateParams(folderIdSchema),
  validate(updateFolderSchema),
  folderController.updateFolder
);

router.delete(
  "/:id",
  validateParams(folderIdSchema),
  folderController.deleteFolder
);

module.exports = router;