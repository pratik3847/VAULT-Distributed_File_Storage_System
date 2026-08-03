const {
  hashPassword,
  comparePassword,
} = require("../utils/password");

async function test() {
  const password = "Password123";

  const hashedPassword = await hashPassword(password);

  console.log("Original Password:", password);
  console.log("Hashed Password:", hashedPassword);

  const isMatch = await comparePassword(password, hashedPassword);

  console.log("Password Match:", isMatch);
}

test().catch(console.error);