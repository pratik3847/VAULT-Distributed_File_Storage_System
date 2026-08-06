const { z } = require("zod");

const signupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),

  email: z.string().email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),

  password: z.string().min(1, "Password is required"),
});

const updateProfileSchema = z.object({
  name: z.string().min(3).optional(),

  email: z.string().email().optional(),
});

module.exports = {
  signupSchema,
  loginSchema,
  updateProfileSchema,
};