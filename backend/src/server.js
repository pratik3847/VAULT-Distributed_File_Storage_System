require("dotenv").config();

const app = require("./app");
const { cleanupAbandonedUploads } = require("./services/cleanup.service");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Initial sweep for abandoned upload sessions on startup
  cleanupAbandonedUploads();

  // Schedule periodic cleanup every 6 hours
  setInterval(() => {
    cleanupAbandonedUploads();
  }, 6 * 60 * 60 * 1000);
});