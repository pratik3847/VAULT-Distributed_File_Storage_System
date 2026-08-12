import { useEffect, useMemo, useState } from "react";
import { Upload, Trash2, FolderOutput, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import FileTable from "../components/FileTable";
import LoadingState from "../components/LoadingState";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import Topbar from "../components/Topbar";
import UploadModal from "../components/UploadModal";
import FolderDialog from "../components/FolderDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import ShareModal from "../components/ShareModal";
import FolderPickerModal from "../components/FolderPickerModal";
import FilePreviewModal from "../components/FilePreviewModal";
import AppLayout from "../layouts/AppLayout";
import useFiles from "../hooks/useFiles";
import useUpload from "../hooks/useUpload";
import { listFilesRequest } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const {
    items,
    loading,
    error,
    openFolder,
    downloadItem,
    refresh,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
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
    batchMoveOpen,
    setBatchMoveOpen,
    batchDeleteConfirmOpen,
    setBatchDeleteConfirmOpen,
    handleBatchDelete,
    handleBatchMove,
    handleDropOnFolder,
  } = useFiles(null);

  const { open, uploads, openModal, closeModal, queueFiles, retryUpload } = useUpload({
    folderId: null,
    onSuccess: refresh,
  });

  const [allFiles, setAllFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let isMounted = true;
    listFilesRequest()
      .then((res) => {
        if (isMounted) {
          setAllFiles(res.data.data || []);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [items]);

  const summary = useMemo(() => {
    const folderCount = items.filter((item) => item.kind === "folder").length;
    const fileCount = allFiles.length;
    const totalSize = allFiles.reduce((total, item) => total + (item.size || 0), 0);

    return {
      folderCount,
      fileCount,
      totalSize,
      recentItems: [...items]
        .sort((left, right) => right.sortModified - left.sortModified)
        .slice(0, 10),
    };
  }, [items, allFiles]);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files || []);
    if (files.length) {
      queueFiles(files);
    }
  };

  return (
    <AppLayout
      sidebar={<Sidebar />}
      topbar={<Topbar title="Overview" onOpenUpload={openModal} />}
    >
      {loading ? <LoadingState label="Loading dashboard..." /> : null}

      {!loading && error ? <div className="status-state error">{error}</div> : null}

      {!loading && !error ? (
        <>
          <section className="stats-grid">
            <StatCard
              label="TOTAL FILES"
              value={summary.fileCount.toString().padStart(2, "0")}
              detail="All uploaded files"
            />

            <StatCard
              label="STORAGE USED"
              value={formatDashboardSize(summary.totalSize)}
              detail="Derived from your uploaded files"
            />

            <StatCard
              label="FOLDERS"
              value={summary.folderCount.toString().padStart(2, "0")}
              detail="Accessible folders in root"
            />

            <StatCard
              label="WORKSPACE"
              value="Vault"
              detail="Authenticated cloud storage"
            />
          </section>

          {/* Bulk Action Bar when items selected */}
          {selectedIds.length > 0 && (
            <div className="bulk-action-bar">
              <span>{selectedIds.length} item(s) selected</span>
              <div className="bulk-actions">
                <button
                  type="button"
                  className="bulk-btn primary"
                  onClick={() => setBatchMoveOpen(true)}
                >
                  <FolderOutput size={15} /> Move Selected
                </button>

                <button
                  type="button"
                  className="bulk-btn danger"
                  onClick={() => setBatchDeleteConfirmOpen(true)}
                >
                  <Trash2 size={15} /> Delete Selected
                </button>

                <button
                  type="button"
                  className="bulk-btn icon"
                  title="Deselect all"
                  onClick={clearSelection}
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          )}

          <section className="section-header">
            <div>
              <p className="section-index">01</p>
              <h2>Recent files</h2>
            </div>

            <button
              className="text-button"
              type="button"
              onClick={() => navigate("/recent")}
            >
              View all →
            </button>
          </section>

          {summary.recentItems.length ? (
            <FileTable
              files={summary.recentItems}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onSelectAll={selectAll}
              onOpenFolder={openFolder}
              onDownloadFile={downloadItem}
              onRenameItem={openRenameModal}
              onDeleteItem={openDeleteModal}
              onMoveItem={openMoveModal}
              onStarItem={handleStarItem}
              onShareItem={openShareModal}
              onDropOnFolder={handleDropOnFolder}
              onPreviewFile={openPreviewModal}
            />
          ) : (
            <div className="empty-state">
              <h3>Your Vault is empty</h3>
              <p>Create a folder or upload a file to get started.</p>
            </div>
          )}

          <section
            className={`upload-section ${isDragging ? "active" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="upload-icon">
              <Upload size={20} />
            </div>

            <div>
              <h3>Drop files anywhere here</h3>
              <p>
                Large files use resumable chunk uploads and are stored securely in
                S3.
              </p>
            </div>

            <button className="upload-button" type="button" onClick={openModal}>
              <Upload size={15} />
              Upload files
            </button>
          </section>

          <footer className="footer">
            <span>VAULT FILE STORAGE</span>
            <span>SECURE · RESUMABLE · S3</span>
          </footer>
        </>
      ) : null}

      {/* Modals & Dialogs */}
      <FolderDialog
        open={Boolean(renamingItem)}
        title={`Rename ${renamingItem?.kind === "folder" ? "folder" : "file"}`}
        initialValue={renamingItem?.name || ""}
        submitLabel="Rename"
        onSubmit={handleRenameFolder}
        onClose={closeRenameModal}
      />

      <ConfirmDialog
        open={Boolean(deletingItem)}
        title={`Delete ${deletingItem?.kind === "folder" ? "folder" : "file"}?`}
        message={`Are you sure you want to delete "${deletingItem?.name}"? ${
          deletingItem?.kind === "folder" ? "All files inside this folder will be permanently deleted." : "This action cannot be undone."
        }`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />

      <ConfirmDialog
        open={batchDeleteConfirmOpen}
        title={`Delete ${selectedIds.length} items?`}
        message={`Are you sure you want to delete these ${selectedIds.length} selected items? Any folders will have their contents deleted.`}
        confirmLabel="Delete All"
        onConfirm={handleBatchDelete}
        onCancel={() => setBatchDeleteConfirmOpen(false)}
      />

      <FolderPickerModal
        open={Boolean(movingItem)}
        title={`Move "${movingItem?.name}" to...`}
        onClose={closeMoveModal}
        onConfirm={handleConfirmMove}
      />

      <FolderPickerModal
        open={batchMoveOpen}
        title={`Move ${selectedIds.length} items to...`}
        onClose={() => setBatchMoveOpen(false)}
        onConfirm={handleBatchMove}
      />

      <ShareModal
        open={Boolean(sharingItem)}
        item={sharingItem}
        onClose={closeShareModal}
      />

      <FilePreviewModal
        open={Boolean(previewItem)}
        file={previewItem}
        onClose={closePreviewModal}
        onDownload={downloadItem}
      />

      <UploadModal
        open={open}
        currentFolderName="My Files"
        uploads={uploads}
        onClose={closeModal}
        onSelectFiles={queueFiles}
        onSelectFolder={queueFiles}
        onRetry={retryUpload}
      />
    </AppLayout>
  );
}

function formatDashboardSize(bytes) {
  if (!bytes) {
    return "0 B";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export default Dashboard;