require("dotenv").config();

const jwt = require("jsonwebtoken");

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