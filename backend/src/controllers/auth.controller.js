const authService = require("../services/auth.service");

async function signup(req, res) {
  const result = await authService.signup(req.body);

  return res.status(201).json(result);
}

module.exports = {
  signup,
};