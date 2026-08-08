const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");

const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);

  return res.status(201).json({
  success: true,
  data: result,
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  return res.status(200).json({
    success: true,
    data: result,
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user.id);

  return res.status(200).json({
    success: true,
    data: profile,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await authService.updateProfile(
    req.user.id,
    req.body
  );

  return res.status(200).json({
    success: true,
    data: profile,
  });
});

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
};