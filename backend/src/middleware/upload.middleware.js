const multer = require("multer");
const path = require("path");
const { randomUUID } = require("crypto");
const AppError = require("../utils/appError");

const destinationPath = path.join(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, destinationPath);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const fileName = `${randomUUID()}${extension}`;

    cb(null, fileName);
  },
});

const allowedMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
];

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new AppError("Unsupported file type", 400), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = upload;