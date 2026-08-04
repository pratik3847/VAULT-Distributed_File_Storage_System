const express = require("express");
const authRoutes = require("./routes/auth.routes");



const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/auth", authRoutes);

module.exports = app;