import { useMemo } from "react";

import AppLayout from "../layouts/AppLayout";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import FileTable from "../components/FileTable";
import LoadingState from "../components/LoadingState";
import FolderDialog from "../components/FolderDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import useFiles from "../hooks/useFiles";

function Recent() {
  const {
    items,
    loading,
    error,
    openFolder,
    downloadItem,
    renamingItem,
    openRenameModal,
    closeRenameModal,
    handleRenameFolder,
    deletingItem,
    openDeleteModal,
    closeDeleteModal,
    handleConfirmDelete,
  } = useFiles(null);

  const recentItems = useMemo(
    () => [...items].sort((left, right) => right.sortModified - left.sortModified),
    [items]
  );

  return (
    <AppLayout sidebar={<Sidebar />} topbar={<Topbar title="Recent" />}>
      {loading ? <LoadingState label="Loading recent files..." /> : null}

      {!loading && error ? <div className="status-state error">{error}</div> : null}

      {!loading && !error ? (
        recentItems.length ? (
          <FileTable
            files={recentItems}
            onOpenFolder={openFolder}
            onDownloadFile={downloadItem}
            onRenameItem={openRenameModal}
            onDeleteItem={openDeleteModal}
          />
        ) : (
          <div className="empty-state">
            <h3>No recent activity</h3>
            <p>Files you open or upload will appear here.</p>
          </div>
        )
      ) : null}

      <FolderDialog
        open={Boolean(renamingItem)}
        title="Rename folder"
        initialValue={renamingItem?.name || ""}
        submitLabel="Rename"
        onSubmit={handleRenameFolder}
        onClose={closeRenameModal}
      />

      <ConfirmDialog
        open={Boolean(deletingItem)}
        title={`Delete ${deletingItem?.kind === "folder" ? "folder" : "file"}?`}
        message={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />
    </AppLayout>
  );
}

export default Recent;