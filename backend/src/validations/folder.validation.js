const { z } = require("zod");

const createFolderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Folder name is required")
    .max(100, "Folder name must not exceed 100 characters"),

  parentId: z
    .string()
    .uuid("Invalid parent folder ID")
    .optional()
    .nullable(),
});

const updateFolderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Folder name is required")
    .max(100, "Folder name must not exceed 100 characters"),
});

const folderIdSchema = z.object({
  id: z.string().uuid("Invalid folder ID"),
});

module.exports = {
  createFolderSchema,
  updateFolderSchema,
  folderIdSchema,
};