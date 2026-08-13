const errorHandler = require("./middleware/error.middleware");
const express = require("express");
const cors = require("cors");
const { apiLimiter } = require("./middleware/rateLimit.middleware");
const authRoutes = require("./routes/auth.routes");
const fileRoutes = require("./routes/file.routes");
const uploadRoutes = require("./routes/upload.routes");
const folderRoutes = require("./routes/folder.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
  origin: [
    "http://localhost:5173",
    "https://vault-frontend-beryl.vercel.app",
  ],
})
);

// Global Rate Limiting
app.use(apiLimiter);

// Routes
app.use("/auth", authRoutes);
app.use("/files", fileRoutes);
app.use("/uploads", uploadRoutes);
app.use("/api/folders", folderRoutes);
app.use("/users", userRoutes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    code: "ROUTE_NOT_FOUND",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler — ALWAYS LAST
app.use(errorHandler);

module.exports = app;