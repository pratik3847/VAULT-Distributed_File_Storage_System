import axios from "axios";

export const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:5000");
const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vault_token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("vault_token");
      window.dispatchEvent(new Event("vault_unauthorized"));
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginRequest = (payload) => api.post("/auth/login", payload);
export const signupRequest = (payload) => api.post("/auth/signup", payload);
export const getProfileRequest = () => api.get("/auth/profile");

// User search
export const searchUsersRequest = (query) => api.get(`/users/search?q=${encodeURIComponent(query)}`);

// Folders
export const listRootFoldersRequest = () => api.get("/api/folders");
export const getFolderRequest = (folderId) => api.get(`/api/folders/${folderId}`);
export const createFolderRequest = (payload) => api.post("/api/folders", payload);
export const updateFolderRequest = (folderId, payload) =>
  api.patch(`/api/folders/${folderId}`, payload);
export const moveFolderRequest = (folderId, parentId) =>
  api.patch(`/api/folders/${folderId}/move`, { parentId });
export const toggleStarFolderRequest = (folderId) =>
  api.patch(`/api/folders/${folderId}/star`);
export const trashFolderRequest = (folderId) =>
  api.patch(`/api/folders/${folderId}/trash`);
export const restoreFolderRequest = (folderId) =>
  api.patch(`/api/folders/${folderId}/restore`);
export const deleteFolderRequest = (folderId) =>
  api.delete(`/api/folders/${folderId}`);

// Files
export const listFilesRequest = () => api.get("/files");
export const getFileRequest = (fileId) => api.get(`/files/${fileId}`);
export const deleteFileRequest = (fileId) => api.delete(`/files/${fileId}`);
export const downloadFileRequest = (fileId) =>
  api.get(`/files/${fileId}/download`, { responseType: "blob" });
export const moveFileRequest = (fileId, targetFolderId) =>
  api.patch(`/files/${fileId}/move`, { targetFolderId });
export const renameFileRequest = (fileId, name) =>
  api.patch(`/files/${fileId}`, { name });
export const toggleStarFileRequest = (fileId) =>
  api.patch(`/files/${fileId}/star`);
export const trashFileRequest = (fileId) =>
  api.patch(`/files/${fileId}/trash`);
export const restoreFileRequest = (fileId) =>
  api.patch(`/files/${fileId}/restore`);

// Sharing
export const shareFileRequest = (fileId, { userId, permission }) =>
  api.post(`/files/${fileId}/share`, { userId, permission });
export const getSharedWithMeRequest = () => api.get("/files/shared-with-me");
export const getFileSharesRequest = (fileId) => api.get(`/files/${fileId}/shares`);
export const unshareFileRequest = (fileId, userId) =>
  api.delete(`/files/${fileId}/share/${userId}`);
export const updateSharePermissionRequest = (fileId, userId, permission) =>
  api.patch(`/files/${fileId}/share/${userId}`, { permission });

// Special Listings & Batch Operations
export const getStarredItemsRequest = () => api.get("/files/starred");
export const getTrashedItemsRequest = () => api.get("/files/trashed");
export const batchDeleteRequest = (payload) => api.post("/files/batch-delete", payload);
export const batchMoveRequest = (payload) => api.post("/files/batch-move", payload);

// Chunked Uploads
export const initUploadRequest = (payload) => api.post("/uploads/init", payload);
export const uploadChunkRequest = (uploadId, formData) =>
  api.post(`/uploads/${uploadId}/chunk`, formData);
export const completeUploadRequest = (uploadId) =>
  api.post(`/uploads/${uploadId}/complete`);
export const getUploadStatusRequest = (uploadId) =>
  api.get(`/uploads/${uploadId}/status`);

export default api;