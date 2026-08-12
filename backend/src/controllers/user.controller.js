const userService = require("../services/user.service");
const asyncHandler = require("../utils/asyncHandler");

const searchUsers = asyncHandler(async (req, res) => {
  const query = req.query.q || "";
  const users = await userService.searchUsers(query, req.user.id);

  res.status(200).json({
    success: true,
    data: users,
  });
});

module.exports = {
  searchUsers,
};
