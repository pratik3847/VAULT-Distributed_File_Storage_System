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

  folderId: z
    .string()
    .uuid("Invalid folder ID")
    .optional()
    .nullable(),
});

const chunkParamsSchema = z.object({
  uploadId: z.uuid("Invalid upload ID"),
});

const chunkBodySchema = z.object({
  chunkNumber: z.coerce
    .number()
    .int("Chunk number must be an integer")
    .nonnegative("Chunk number cannot be negative"),
});

module.exports = {
  initUploadSchema,
  chunkParamsSchema,
  chunkBodySchema,
};