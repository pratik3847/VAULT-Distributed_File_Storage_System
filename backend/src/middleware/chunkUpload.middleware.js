const multer = require("multer");

const chunkUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 + 1024,
  },
});

module.exports = chunkUpload;