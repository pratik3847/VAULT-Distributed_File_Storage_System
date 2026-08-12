const { verifyToken } = require("../utils/jwt");
const AppError = require("../utils/appError");

function authenticate(req, res, next) {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return next(new AppError("Unauthorized", 401));
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError("Invalid or expired token", 401));
  }
}

module.exports = authenticate;