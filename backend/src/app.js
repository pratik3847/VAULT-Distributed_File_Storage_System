const errorHandler = require("./middleware/error.middleware");
const express = require("express");
const authRoutes = require("./routes/auth.routes");
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/auth", authRoutes);

// Global Error Handler (Always Last) 
app.use(errorHandler);

module.exports = app;