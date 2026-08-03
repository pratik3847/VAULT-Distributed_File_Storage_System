const { generateToken, verifyToken } = require("../utils/jwt");

const token = generateToken({
  id: 1,
  email: "pratik@gmail.com",
});

console.log("Generated Token:");
console.log(token);

const decoded = verifyToken(token);

console.log("\nDecoded Payload:");
console.log(decoded);