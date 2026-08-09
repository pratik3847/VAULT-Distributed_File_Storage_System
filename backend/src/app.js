const errorHandler = require("./middleware/error.middleware");
const express = require("express");
const authRoutes = require("./routes/auth.routes");
const fileRoutes = require("./routes/file.routes");
const uploadRoutes = require("./routes/upload.routes");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/files", fileRoutes);
app.use("/uploads", uploadRoutes);

// Global Error Handler — ALWAYS LAST
app.use(errorHandler);

module.exports = app; 