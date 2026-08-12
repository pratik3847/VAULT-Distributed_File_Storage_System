import { useEffect, useState } from "react";
import { Folder, FolderPlus, Home, X, ChevronRight } from "lucide-react";
import { listRootFoldersRequest, getFolderRequest } from "../services/api";

function FolderPickerModal({ open, title = "Move to...", onClose, onConfirm }) {
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null); // null means Root / My Files
  const [currentFolder, setCurrentFolder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    loadRoot();
  }, [open]);

  const loadRoot = async () => {
    setLoading(true);
    setCurrentFolder(null);
    setSelectedFolderId(null);
    try {
      const res = await listRootFoldersRequest();
      setFolders(res.data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = async (folder) => {
    setLoading(true);
    setCurrentFolder(folder);
    setSelectedFolderId(folder.id);
    try {
      const res = await getFolderRequest(folder.id);
      setFolders(res.data.data.children || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card folder-picker-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Breadcrumb Path */}
          <div className="picker-path">
            <button
              type="button"
              className={`picker-path-item ${selectedFolderId === null ? "active" : ""}`}
              onClick={loadRoot}
            >
              <Home size={14} /> My Files (Root)
            </button>
            {currentFolder && (
              <>
                <ChevronRight size={14} className="muted" />
                <span className="picker-path-item active">{currentFolder.name}</span>
              </>
            )}
          </div>

          <div className="picker-folder-list">
            {loading ? (
              <div className="picker-empty">Loading folders...</div>
            ) : folders.length === 0 ? (
              <div className="picker-empty">No subfolders here</div>
            ) : (
              folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`picker-folder-row ${selectedFolderId === folder.id ? "selected" : ""}`}
                  onClick={() => setSelectedFolderId(folder.id)}
                  onDoubleClick={() => navigateToFolder(folder)}
                >
                  <div className="picker-folder-info">
                    <Folder size={18} className="folder-icon" />
                    <span>{folder.name}</span>
                  </div>

                  <button
                    type="button"
                    className="picker-enter-btn"
                    title="Open subfolders"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToFolder(folder);
                    }}
                  >
                    Open →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              onConfirm(selectedFolderId);
              onClose();
            }}
          >
            Move Here
          </button>
        </div>
      </div>
    </div>
  );
}

export default FolderPickerModal;
