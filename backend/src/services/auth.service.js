const userRepository = require("../repositories/user.repository");
const { hashPassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");

async function signup(userData) {
  // Check if email already exists
  const existingUser = await userRepository.findByEmail(userData.email);

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password);

  // Create user
  const user = await userRepository.createUser({
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
  });

  // Generate JWT
  const token = generateToken({
    id: user.id,
    email: user.email,
  });

  // Return safe response
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    token,
  };
}

module.exports = {
  signup,
};