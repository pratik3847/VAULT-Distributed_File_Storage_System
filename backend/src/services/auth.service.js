const userRepository = require("../repositories/user.repository");
const {
  hashPassword,
  comparePassword,
} = require("../utils/password");

const { generateToken } = require("../utils/jwt");
const AppError = require("../utils/appError");

async function signup(userData) {
  // Check if email already exists
  const existingUser = await userRepository.findByEmail(userData.email);

  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
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

async function login(userData) {
  const user = await userRepository.findByEmail(userData.email);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await comparePassword(
    userData.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
  });

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

async function getProfile(userId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

async function updateProfile(userId, data) {
  const updatedUser = await userRepository.updateUser(userId, data);

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    createdAt: updatedUser.createdAt,
  };
}

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
};