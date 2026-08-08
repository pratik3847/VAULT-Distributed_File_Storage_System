const fs = require("fs/promises");

const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    // Ignore if file doesn't exist
  }
};

module.exports = {
  deleteFile,
};