const { z } = require("zod");

const fileIdSchema = z.object({
  id: z.string().uuid("Invalid file ID"),
});

module.exports = {
  fileIdSchema,
};