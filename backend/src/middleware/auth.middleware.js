const { verifyToken } = require("../utils/jwt");
const AppError = require("../utils/appError");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    next(new AppError("Invalid or expired token", 401));
  }
}

module.exports = authenticate;