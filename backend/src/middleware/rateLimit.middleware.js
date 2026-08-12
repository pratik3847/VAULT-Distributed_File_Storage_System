const rateLimit = require("express-rate-limit");

const isDev = process.env.NODE_ENV !== "production";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 2000 : 100, // Generous limit in dev mode to prevent developer lockout
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "TOO_MANY_REQUESTS",
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 500 : 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "TOO_MANY_AUTH_ATTEMPTS",
    message: "Too many login/signup attempts from this IP, please try again later",
  },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "UPLOAD_RATE_EXCEEDED",
    message: "Too many upload requests, please slow down",
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
};
