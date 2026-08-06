const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");

const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);

  return res.status(201).json(result);
});

module.exports = {
  signup,
};