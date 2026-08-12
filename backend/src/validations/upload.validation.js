const { z } = require("zod");

const initUploadSchema = z.object({
  originalName: z
    .string()
    .trim()
    .min(1, "Original name is required")
    .max(255, "File name too long"),
  mimeType: z.string().trim().min(1, "MIME type is required"),
  totalSize: z.number().int().positive("Total size must be a positive integer"),
  folderId: z.string().uuid("Invalid folder ID").optional().nullable(),
  checksum: z.string().optional().nullable(),
});

const uploadChunkSchema = z.object({
  uploadId: z.string().uuid("Invalid upload ID"),
  chunkNumber: z.coerce.number().int().min(0, "Chunk number must be 0 or positive"),
});

const completeUploadSchema = z.object({
  uploadId: z.string().uuid("Invalid upload ID"),
  checksum: z.string().optional().nullable(),
});

module.exports = {
  initUploadSchema,
  uploadChunkSchema,
  completeUploadSchema,
};