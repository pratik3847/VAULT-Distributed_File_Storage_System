const { z } = require("zod");

const fileIdSchema = z.object({
  id: z.uuid("Invalid file ID"),
});

module.exports = {
  fileIdSchema,
};