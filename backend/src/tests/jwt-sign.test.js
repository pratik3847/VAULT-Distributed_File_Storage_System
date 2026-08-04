require("dotenv").config();

const jwt = require("jsonwebtoken");

console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("JWT_EXPIRES_IN:", process.env.JWT_EXPIRES_IN);

try {
  const token = jwt.sign(
    { id: "123" },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  console.log("Generated Token:", token);
} catch (err) {
  console.error(err);
}