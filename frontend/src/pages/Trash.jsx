import { useEffect, useState } from "react";
import { RotateCcw, Trash2, FileText, Folder } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingState from "../components/LoadingState";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  getTrashedItemsRequest,
  restoreFileRequest,
  restoreFolderRequest,
  deleteFileRequest,
  deleteFolderRequest,
} from "../services/api";
import { useToast } from "../context/ToastContext";

function Trash() {
  const { showSuccess, showError } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purgingItem, setPurgingItem] = useState(null);

  const fetchTrashed = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getTrashedItemsRequest();
      const { files = [], folders = [] } = res.data.data || {};
      const normalizedFolders = folders.map((f) => ({
        id: f.id,
        kind: "folder",
        name: f.name,
        modified: new Date(f.updatedAt).toLocaleDateString(),
        size: "—",
        raw: f,
      }));
      const normalizedFiles = files.map((f) => ({
        id: f.id,
        kind: "file",
        name: f.originalName,
        modified: new Date(f.updatedAt).toLocaleDateString(),
        size: `${(f.size / 1024).toFixed(1)} KB`,
        raw: f,
      }));

      setItems([...normalizedFolders, ...normalizedFiles]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load trashed items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashed();
  }, []);

  const handleRestore = async (item) => {
    try {
      if (item.kind === "folder") {
        await restoreFolderRequest(item.id);
      } else {
        await restoreFileRequest(item.id);
      }
      showSuccess(`Restored "${item.name}"`);
      fetchTrashed();
    } catch {
      showError("Failed to restore item.");
    }
  };

  const handlePermanentDelete = async () => {
    if (!purgingItem) return;
    try {
      if (purgingItem.kind === "folder") {
        await deleteFolderRequest(purgingItem.id);
      } else {
        await deleteFileRequest(purgingItem.id);
      }
      showSuccess(`Permanently deleted "${purgingItem.name}"`);
      setPurgingItem(null);
      fetchTrashed();
    } catch {
      showError("Failed to delete item.");
    }
  };

  return (
    <AppLayout sidebar={<Sidebar />} topbar={<Topbar title="Trash" />}>
      <section className="files-shell">
        <div className="section-header">
          <div>
            <h2>Recycle Bin</h2>
          </div>
        </div>

        {loading ? <LoadingState label="Loading trash..." /> : null}

        {!loading && error ? <div className="status-state error">{error}</div> : null}

        {!loading && !error ? (
          items.length ? (
            <div className="trash-list">
              {items.map((item) => (
                <div key={item.id} className="trash-row">
                  <div className="trash-item-info">
                    <div className={`file-icon ${item.kind === "folder" ? "folder" : ""}`}>
                      {item.kind === "folder" ? <Folder size={18} /> : <FileText size={18} />}
                    </div>
                    <div>
                      <strong className="block">{item.name}</strong>
                      <span className="muted">Deleted · {item.modified}</span>
                    </div>
                  </div>

                  <div className="trash-actions">
                    <button
                      type="button"
                      className="icon-text-btn"
                      onClick={() => handleRestore(item)}
                    >
                      <RotateCcw size={14} /> Restore
                    </button>

                    <button
                      type="button"
                      className="icon-text-btn danger"
                      onClick={() => setPurgingItem(item)}
                    >
                      <Trash2 size={14} /> Delete Forever
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Trash is empty</h3>
              <p>Items you delete will be kept here until permanently purged.</p>
            </div>
          )
        ) : null}
      </section>

      <ConfirmDialog
        open={Boolean(purgingItem)}
        title={`Permanently delete "${purgingItem?.name}"?`}
        message="This item will be permanently removed from physical storage and cannot be recovered."
        confirmLabel="Delete Permanently"
        onConfirm={handlePermanentDelete}
        onCancel={() => setPurgingItem(null)}
      />
    </AppLayout>
  );
}

export default Trash;