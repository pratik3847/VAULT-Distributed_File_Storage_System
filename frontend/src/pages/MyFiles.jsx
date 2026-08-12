import { useParams } from "react-router-dom";
import { FolderOutput, Trash2, X } from "lucide-react";

import AppLayout from "../layouts/AppLayout";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Breadcrumbs from "../components/Breadcrumbs";
import FileTable from "../components/FileTable";
import LoadingState from "../components/LoadingState";
import UploadModal from "../components/UploadModal";
import FolderDialog from "../components/FolderDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import ShareModal from "../components/ShareModal";
import FolderPickerModal from "../components/FolderPickerModal";
import FilePreviewModal from "../components/FilePreviewModal";
import NewMenu from "../components/NewMenu";
import useFiles from "../hooks/useFiles";
import useUpload from "../hooks/useUpload";

function MyFiles() {
  const { folderId } = useParams();
  const {
    currentFolder,
    breadcrumbs,
    items,
    loading,
    error,
    query,
    setQuery,
    sortKey,
    setSortKey,
    refresh,
    openFolder,
    downloadItem,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
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
    batchMoveOpen,
    setBatchMoveOpen,
    batchDeleteConfirmOpen,
    setBatchDeleteConfirmOpen,
    handleBatchDelete,
    handleBatchMove,
    handleDropOnFolder,
    handleDropOnBreadcrumb,
  } = useFiles(folderId);

  const {
    open,
    uploads,
    openModal,
    closeModal,
    queueFiles,
    retryUpload,
  } = useUpload({
    folderId,
    onSuccess: refresh,
  });

  return (
    <AppLayout
      sidebar={<Sidebar />}
      topbar={
        <Topbar
          title={currentFolder?.name || "My files"}
          newMenu={
            <NewMenu
              onNewFolder={openCreateModal}
              onUploadFiles={openModal}
              onUploadFolder={openModal}
            />
          }
        />
      }
    >
      <section className="files-shell">
        <div className="files-shell-header">
          <Breadcrumbs
            items={breadcrumbs}
            onDropOnBreadcrumb={handleDropOnBreadcrumb}
          />

          <div className="files-toolbar">
            <input
              className="files-search"
              type="search"
              placeholder="Search files and folders"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />

            <select className="files-sort" value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
              <option value="name">Sort by name</option>
              <option value="modified">Sort by modified</option>
              <option value="size">Sort by size</option>
            </select>
          </div>
        </div>

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

        {loading ? <LoadingState label="Loading files..." /> : null}

        {!loading && error ? <div className="status-state error">{error}</div> : null}

        {!loading && !error ? (
          items.length ? (
            <FileTable
              files={items}
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
              <h3>{currentFolder ? "This folder is empty" : "No files yet"}</h3>
              <p>
                Use New folder or upload files to start organizing your Vault.
              </p>
            </div>
          )
        ) : null}
      </section>

      {/* Modals & Dialogs */}
      <FolderDialog
        open={createModalOpen}
        title="New folder"
        submitLabel="Create"
        onSubmit={handleCreateFolder}
        onClose={closeCreateModal}
      />

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
        currentFolderName={currentFolder?.name}
        uploads={uploads}
        onClose={closeModal}
        onSelectFiles={queueFiles}
        onSelectFolder={queueFiles}
        onRetry={retryUpload}
      />
    </AppLayout>
  );
}

export default MyFiles;