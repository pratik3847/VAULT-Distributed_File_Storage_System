const userRepository = require("../repositories/user.repository");

const searchUsers = async (query, currentUserId) => {
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return [];
  }
  return await userRepository.searchUsers(query.trim(), currentUserId);
};

module.exports = {
  searchUsers,
};
