const jwt = require("jsonwebtoken");

const JWT_SECRET = "your-super-secret-key";
const JWT_EXPIRES_IN = "1h";

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  generateToken,
  verifyToken,
};