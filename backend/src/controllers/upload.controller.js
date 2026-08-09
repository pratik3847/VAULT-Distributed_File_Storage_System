const uploadService = require("../services/upload.service");
const asyncHandler = require("../utils/asyncHandler");

const initUpload = asyncHandler(async (req, res) => {
  const upload = await uploadService.initUpload({
    ...req.body,
    ownerId: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: "Upload session initialized successfully",
    data: upload,
  });
});

module.exports = {
  initUpload,
};