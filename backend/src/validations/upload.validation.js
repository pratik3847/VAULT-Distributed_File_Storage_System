const { z } = require("zod");

const initUploadSchema = z.object({
  originalName: z
    .string()
    .min(1, "Original filename is required"),

  mimeType: z
    .string()
    .min(1, "MIME type is required"),

  totalSize: z
    .number()
    .int("File size must be an integer")
    .positive("File size must be greater than 0"),
});

module.exports = {
  initUploadSchema,
};