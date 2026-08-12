import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  batchDeleteRequest,
  batchMoveRequest,
  createFolderRequest,
  deleteFileRequest,
  deleteFolderRequest,
  downloadFileRequest,
  getFolderRequest,
  listFilesRequest,
  listRootFoldersRequest,
  moveFileRequest,
  moveFolderRequest,
  renameFileRequest,
  toggleStarFileRequest,
  toggleStarFolderRequest,
  trashFileRequest,
  trashFolderRequest,
  updateFolderRequest,
} from "../services/api";

function formatBytes(value) {
  if (value == null) {
    return "—";
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

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function normalizeFolder(folder) {
  const timestamp = new Date(folder.updatedAt || folder.createdAt).getTime();

  return {
    id: folder.id,
    kind: "folder",
    name: folder.name,
    modified: formatDate(folder.updatedAt || folder.createdAt),
    size: "—",
    sortSize: Number.POSITIVE_INFINITY,
    sortModified: timestamp,
    parentId: folder.parentId,
    isStarred: folder.isStarred || false,
    raw: folder,
  };
}

function normalizeFile(file) {
  const timestamp = new Date(file.updatedAt || file.createdAt).getTime();

  return {
    id: file.id,
    kind: "file",
    name: file.originalName,
    modified: formatDate(file.updatedAt || file.createdAt),
    size: formatBytes(file.size),
    mimeType: file.mimeType,
    sortSize: file.size,
    sortModified: timestamp,
    folderId: file.folderId,
    isStarred: file.isStarred || false,
    raw: file,
  };
}

async function buildBreadcrumbs(folder) {
  const trail = [];
  let current = folder;

  while (current) {
    trail.push({
      id: current.id,
      label: current.name,
      path: `/files/${current.id}`,
    });

    if (!current.parentId) {
      break;
    }

    const response = await getFolderRequest(current.parentId);
    current = response.data.data;
  }

  return trail.reverse();
}

function useFiles(folderId) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([
    { id: "root", label: "My Files", path: "/files" },
  ]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [renamingItem, setRenamingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [movingItem, setMovingItem] = useState(null);
  const [sharingItem, setSharingItem] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [batchMoveOpen, setBatchMoveOpen] = useState(false);
  const [batchDeleteConfirmOpen, setBatchDeleteConfirmOpen] = useState(false);

  const loadContents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (folderId) {
        const response = await getFolderRequest(folderId);
        const folder = response.data.data;
        const trail = await buildBreadcrumbs(folder);

        setCurrentFolder(folder);
        setBreadcrumbs([{ id: "root", label: "My Files", path: "/files" }, ...trail]);
        setItems([
          ...folder.children.map(normalizeFolder),
          ...folder.files.map(normalizeFile),
        ]);
        return;
      }

      const [foldersResponse, filesResponse] = await Promise.all([
        listRootFoldersRequest(),
        listFilesRequest(),
      ]);

      const rootFiles = filesResponse.data.data.filter((file) => !file.folderId);

      setCurrentFolder(null);
      setBreadcrumbs([{ id: "root", label: "My Files", path: "/files" }]);
      setItems([
        ...foldersResponse.data.data.map(normalizeFolder),
        ...rootFiles.map(normalizeFile),
      ]);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Unable to load your files."
      );
    } finally {
      setLoading(false);
    }
  }, [folderId, refreshIndex]);

  useEffect(() => {
    loadContents();
  }, [loadContents]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = normalizedQuery
      ? items.filter((item) => item.name.toLowerCase().includes(normalizedQuery))
      : items;

    return [...filtered].sort((left, right) => {
      if (left.kind !== right.kind) {
        return left.kind === "folder" ? -1 : 1;
      }

      if (sortKey === "modified") {
        return right.sortModified - left.sortModified;
      }

      if (sortKey === "size") {
        return left.sortSize - right.sortSize;
      }

      return left.name.localeCompare(right.name);
    });
  }, [items, query, sortKey]);

  const refresh = useCallback(() => {
    setSelectedIds([]);
    setRefreshIndex((value) => value + 1);
  }, []);

  const openFolder = useCallback(
    (folder) => {
      navigate(`/files/${folder.id}`);
    },
    [navigate]
  );

  // Selection handlers
  const toggleSelect = useCallback((item) => {
    setSelectedIds((prev) =>
      prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id]
    );
  }, []);

  const selectAll = useCallback((checkAll) => {
    if (checkAll) {
      setSelectedIds(filteredItems.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  }, [filteredItems]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Action handlers
  const openCreateModal = useCallback(() => setCreateModalOpen(true), []);
  const closeCreateModal = useCallback(() => setCreateModalOpen(false), []);

  const handleCreateFolder = useCallback(
    async (name) => {
      await createFolderRequest({
        name,
        parentId: folderId || null,
      });
      refresh();
    },
    [folderId, refresh]
  );

  const openRenameModal = useCallback((item) => {
    setRenamingItem(item);
  }, []);

  const closeRenameModal = useCallback(() => setRenamingItem(null), []);

  const handleRenameFolder = useCallback(
    async (name) => {
      if (!renamingItem) return;
      if (renamingItem.kind === "folder") {
        await updateFolderRequest(renamingItem.id, { name });
      } else {
        await renameFileRequest(renamingItem.id, name);
      }
      refresh();
    },
    [renamingItem, refresh]
  );

  const openDeleteModal = useCallback((item) => {
    setDeletingItem(item);
  }, []);

  const closeDeleteModal = useCallback(() => setDeletingItem(null), []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingItem) return;
    if (deletingItem.kind === "folder") {
      await trashFolderRequest(deletingItem.id);
    } else {
      await trashFileRequest(deletingItem.id);
    }
    setDeletingItem(null);
    refresh();
  }, [deletingItem, refresh]);

  const openMoveModal = useCallback((item) => {
    setMovingItem(item);
  }, []);

  const closeMoveModal = useCallback(() => setMovingItem(null), []);

  const handleConfirmMove = useCallback(
    async (targetFolderId) => {
      if (!movingItem) return;
      if (movingItem.kind === "folder") {
        await moveFolderRequest(movingItem.id, targetFolderId);
      } else {
        await moveFileRequest(movingItem.id, targetFolderId);
      }
      refresh();
    },
    [movingItem, refresh]
  );

  const openShareModal = useCallback((item) => {
    setSharingItem(item);
  }, []);

  const closeShareModal = useCallback(() => setSharingItem(null), []);

  const openPreviewModal = useCallback((item) => {
    setPreviewItem(item);
  }, []);

  const closePreviewModal = useCallback(() => setPreviewItem(null), []);

  const handleStarItem = useCallback(
    async (item) => {
      if (item.kind === "folder") {
        await toggleStarFolderRequest(item.id);
      } else {
        await toggleStarFileRequest(item.id);
      }
      refresh();
    },
    [refresh]
  );

  const handleBatchDelete = useCallback(async () => {
    const selectedItems = items.filter((i) => selectedIds.includes(i.id));
    const fileIds = selectedItems.filter((i) => i.kind === "file").map((i) => i.id);
    const folderIds = selectedItems.filter((i) => i.kind === "folder").map((i) => i.id);

    for (const fId of fileIds) {
      await trashFileRequest(fId);
    }
    for (const fId of folderIds) {
      await trashFolderRequest(fId);
    }
    setBatchDeleteConfirmOpen(false);
    refresh();
  }, [items, selectedIds, refresh]);

  const handleBatchMove = useCallback(
    async (targetFolderId) => {
      const selectedItems = items.filter((i) => selectedIds.includes(i.id));
      const fileIds = selectedItems.filter((i) => i.kind === "file").map((i) => i.id);
      const folderIds = selectedItems.filter((i) => i.kind === "folder").map((i) => i.id);

      await batchMoveRequest({ fileIds, folderIds, targetFolderId });
      setBatchMoveOpen(false);
      refresh();
    },
    [items, selectedIds, refresh]
  );

  // Drag and drop handler
  const handleDropOnFolder = useCallback(
    async (draggedItem, targetFolder) => {
      if (!draggedItem || !targetFolder) return;
      if (draggedItem.id === targetFolder.id) return;

      if (draggedItem.kind === "folder") {
        await moveFolderRequest(draggedItem.id, targetFolder.id);
      } else {
        await moveFileRequest(draggedItem.id, targetFolder.id);
      }
      refresh();
    },
    [refresh]
  );

  const handleDropOnBreadcrumb = useCallback(
    async (draggedItem, targetFolderId) => {
      if (!draggedItem) return;

      if (draggedItem.kind === "folder") {
        await moveFolderRequest(draggedItem.id, targetFolderId);
      } else {
        await moveFileRequest(draggedItem.id, targetFolderId);
      }
      refresh();
    },
    [refresh]
  );

  const downloadItem = useCallback(async (item) => {
    const response = await downloadFileRequest(item.id);
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const anchor = document.createElement("a");

    anchor.href = blobUrl;
    anchor.download = item.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(blobUrl);
  }, []);

  return {
    currentFolder,
    breadcrumbs,
    items: filteredItems,
    loading,
    error,
    query,
    setQuery,
    sortKey,
    setSortKey,
    refresh,
    openFolder,
    downloadItem,
    // Selection state & handlers
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    // Modal controls
    createModalOpen,
    openCreateModal,
    closeCreateModal,
    handleCreateFolder,
    renamingItem,
    openRenameModal,
    closeRenameModal,
    handleRenameFolder,
    deletingItem,
    openDeleteModal,
    closeDeleteModal,
    handleConfirmDelete,
    movingItem,
    openMoveModal,
    closeMoveModal,
    handleConfirmMove,
    sharingItem,
    openShareModal,
    closeShareModal,
    previewItem,
    openPreviewModal,
    closePreviewModal,
    handleStarItem,
    // Batch controls
    batchMoveOpen,
    setBatchMoveOpen,
    batchDeleteConfirmOpen,
    setBatchDeleteConfirmOpen,
    handleBatchDelete,
    handleBatchMove,
    // Drag & Drop
    handleDropOnFolder,
    handleDropOnBreadcrumb,
  };
}

export default useFiles;