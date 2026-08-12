import { FolderOpen, Upload, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import UploadProgress from "./UploadProgress";

function UploadModal({
  open,
  currentFolderName,
  uploads,
  onClose,
  onSelectFiles,
  onSelectFolder,
  onRetry,
}) {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const activeUploads = useMemo(
    () => uploads.filter((item) => item.status === "uploading"),
    [uploads]
  );

  if (!open) {
    return null;
  }

  const openFilePicker = () => fileInputRef.current?.click();
  const openFolderPicker = () => folderInputRef.current?.click();

  const handleFileSelection = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (files.length) {
      onSelectFiles(files);
    }
  };

  const handleFolderSelection = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (files.length) {
      onSelectFolder(files);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files || []);

    if (files.length) {
      onSelectFiles(files);
    }
  };

  return (
    <div
      className="upload-modal-backdrop"
      role="presentation"
      onClick={() => activeUploads.length === 0 && onClose()}
    >
      <div
        className="upload-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="upload-modal-header">
          <div>
            <p className="upload-kicker">UPLOAD TO</p>
            <h3>{currentFolderName || "My Files"}</h3>
          </div>

          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            disabled={activeUploads.length > 0}
          >
            <X size={16} />
          </button>
        </div>

        <div
          className={`upload-dropzone ${isDragging ? "active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-dropzone-icon">
            <Upload size={20} />
          </div>

          <h4>Drop files here</h4>
          <p>
            Files will upload in 5 MB chunks and finish in the current folder.
          </p>

          <div className="upload-modal-actions">
            <button
              type="button"
              className="upload-ghost-button"
              onClick={openFilePicker}
            >
              <FolderOpen size={15} />
              Select files
            </button>

            <button
              type="button"
              className="upload-ghost-button"
              onClick={openFolderPicker}
            >
              <FolderOpen size={15} />
              Select folder
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={handleFileSelection}
          />
          <input
            ref={folderInputRef}
            type="file"
            multiple
            hidden
            onChange={handleFolderSelection}
            webkitdirectory=""
            directory=""
          />
        </div>

        <div className="upload-list">
          {uploads.length ? (
            uploads.map((upload) => (
              <UploadProgress key={upload.id} upload={upload} onRetry={onRetry} />
            ))
          ) : (
            <div className="upload-empty">No files queued yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadModal;