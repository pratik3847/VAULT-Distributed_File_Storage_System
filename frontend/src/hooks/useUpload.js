import { useCallback, useMemo, useState } from "react";

import {
  completeUploadRequest,
  initUploadRequest,
  uploadChunkRequest,
} from "../services/api";

const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024;

function buildUploadId(file, index) {
  return `${file.name}-${file.size}-${file.lastModified}-${index}`;
}

function formatBytes(value) {
  if (value == null || isNaN(value)) {
    return "0 B";
  }
  if (value < 1024) {
    return `${value} B`;
  }
  const units = ["KB", "MB", "GB", "TB"];
  let size = value / 1024;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function useUpload({ folderId, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [uploads, setUploads] = useState([]);

  const hasActiveUploads = useMemo(
    () => uploads.some((item) => item.status === "uploading"),
    [uploads]
  );

  const patchUpload = useCallback((id, updater) => {
    setUploads((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updater(item) } : item))
    );
  }, []);

  const processFile = useCallback(
    async (uploadId, file) => {
      const initResponse = await initUploadRequest({
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        totalSize: file.size,
        folderId: folderId || null,
      });

      const { uploadId: sessionId, chunkSize = DEFAULT_CHUNK_SIZE, totalChunks } =
        initResponse.data.data;

      patchUpload(uploadId, () => ({
        status: "uploading",
        chunkSize,
        totalChunks,
        sessionId,
        progressLabel: `0 / ${totalChunks} chunks • 0 B / ${formatBytes(file.size)}`,
      }));

      for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber += 1) {
        const start = chunkNumber * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        const formData = new FormData();

        formData.append("chunk", chunk, file.name);
        formData.append("chunkNumber", String(chunkNumber));

        await uploadChunkRequest(sessionId, formData);

        const completedChunks = chunkNumber + 1;
        const progress = Math.round((end / file.size) * 100);

        patchUpload(uploadId, () => ({
          completedChunks,
          progress,
          progressLabel: `${completedChunks} / ${totalChunks} chunks • ${formatBytes(end)} / ${formatBytes(file.size)}`,
        }));
      }

      await completeUploadRequest(sessionId);

      patchUpload(uploadId, () => ({
        status: "completed",
        progress: 100,
        progressLabel: `${formatBytes(file.size)} uploaded`,
      }));
    },
    [folderId, patchUpload]
  );

  const queueFiles = useCallback(
    async (selectedFiles) => {
      const files = selectedFiles.filter(Boolean);

      if (!files.length) {
        return;
      }

      setOpen(true);

      const seededUploads = files.map((file, index) => ({
        id: buildUploadId(file, index),
        file,
        name: file.name,
        size: file.size,
        progress: 0,
        progressLabel: "Queued",
        completedChunks: 0,
        totalChunks: 0,
        status: "queued",
        error: "",
      }));

      setUploads(seededUploads);

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const uploadId = buildUploadId(file, index);

        try {
          await processFile(uploadId, file);
        } catch (error) {
          patchUpload(uploadId, () => ({
            status: "failed",
            error: error?.response?.data?.message || error?.message || "Upload failed",
            progressLabel: "Failed",
          }));
        }
      }

      if (onSuccess) {
        onSuccess();
      }
    },
    [onSuccess, patchUpload, processFile]
  );

  const retryUpload = useCallback(
    async (uploadId) => {
      const target = uploads.find((item) => item.id === uploadId);

      if (!target?.file) {
        patchUpload(uploadId, () => ({
          error: "Retry by selecting the file again.",
        }));
        return;
      }

      try {
        await processFile(uploadId, target.file);
      } catch (error) {
        patchUpload(uploadId, () => ({
          status: "failed",
          error: error?.response?.data?.message || error?.message || "Upload failed",
          progressLabel: "Failed",
        }));
      }
    },
    [patchUpload, processFile, uploads]
  );

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => {
    if (!hasActiveUploads) {
      setOpen(false);
    }
  }, [hasActiveUploads]);

  return {
    open,
    uploads,
    openModal,
    closeModal,
    queueFiles,
    retryUpload,
  };
}

export default useUpload;