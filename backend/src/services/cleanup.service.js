const fs = require("fs/promises");
const path = require("path");
const uploadRepository = require("../repositories/upload.repository");

const CLEANUP_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

const cleanupAbandonedUploads = async () => {
  try {
    const olderThanDate = new Date(Date.now() - CLEANUP_THRESHOLD_MS);
    const abandonedSessions = await uploadRepository.findAbandonedSessions(olderThanDate);

    if (!abandonedSessions.length) {
      return { cleanedCount: 0 };
    }

    let cleanedCount = 0;

    for (const session of abandonedSessions) {
      try {
        // Delete chunk directory
        const chunkDirectory = path.join(
          __dirname,
          "../../uploads/sessions",
          session.id
        );
        await fs.rm(chunkDirectory, { recursive: true, force: true }).catch(() => {});

        // Delete database upload session record
        await uploadRepository.deleteUploadSession(session.id);
        cleanedCount++;
      } catch (err) {
        console.error(`Failed to clean abandoned upload session ${session.id}:`, err);
      }
    }

    console.log(`[CleanupService] Cleaned up ${cleanedCount} abandoned upload session(s).`);
    return { cleanedCount };
  } catch (error) {
    console.error("[CleanupService] Error during abandoned upload cleanup:", error);
    return { cleanedCount: 0, error: error.message };
  }
};

module.exports = {
  cleanupAbandonedUploads,
};
