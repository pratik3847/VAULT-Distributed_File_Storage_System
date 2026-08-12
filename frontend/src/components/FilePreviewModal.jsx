import { Download, FileText, X, Image as ImageIcon, Music, Video, Calendar, HardDrive, Tag } from "lucide-react";

function FilePreviewModal({ open, file, onClose, onDownload }) {
  if (!open || !file) return null;

  const isImage = file.mimeType?.startsWith("image/") || file.raw?.mimeType?.startsWith("image/");
  const isAudio = file.mimeType?.startsWith("audio/") || file.raw?.mimeType?.startsWith("audio/");
  const isVideo = file.mimeType?.startsWith("video/") || file.raw?.mimeType?.startsWith("video/");
  const isPdf =
    file.mimeType === "application/pdf" ||
    file.raw?.mimeType === "application/pdf" ||
    file.name?.toLowerCase().endsWith(".pdf");

  const token = localStorage.getItem("vault_token");
  const fileId = file.id;
  const fileApiUrl = fileId ? `http://localhost:5000/files/${fileId}/download` : "";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal-card preview-modal-card ${isPdf ? "pdf-modal-card" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{file.name}</h3>
            <span className="muted mono">{file.size}</span>
          </div>
          <button className="modal-close" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body preview-modal-body">
          <div className="preview-canvas">
            {isPdf ? (
              <div className="pdf-preview-wrap">
                <iframe
                  src={`${fileApiUrl}?token=${token}#toolbar=1&navpanes=0`}
                  title={file.name}
                  width="100%"
                  height="460px"
                  style={{ border: "none", borderRadius: "8px", background: "#fff" }}
                />
              </div>
            ) : isImage ? (
              <div className="image-preview-wrap">
                <img
                  src={`${fileApiUrl}?token=${token}`}
                  alt={file.name}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="preview-fallback" style={{ display: "none" }}>
                  <ImageIcon size={48} className="muted" />
                  <p>Image preview unavailable</p>
                </div>
              </div>
            ) : isAudio ? (
              <div className="media-preview-wrap">
                <Music size={48} className="text-indigo" />
                <audio controls src={`${fileApiUrl}?token=${token}`} />
              </div>
            ) : isVideo ? (
              <div className="media-preview-wrap">
                <Video size={48} className="text-indigo" />
                <video controls src={`${fileApiUrl}?token=${token}`} width="100%" />
              </div>
            ) : (
              <div className="generic-preview-wrap">
                <FileText size={64} className="text-indigo" />
                <p>Preview not available for this file type</p>
              </div>
            )}
          </div>

          <div className="preview-metadata-panel">
            <h4>File Details</h4>
            <div className="meta-list">
              <div className="meta-item">
                <Tag size={15} className="meta-icon" />
                <div>
                  <label>Type</label>
                  <span>{file.raw?.mimeType || file.mimeType || (isPdf ? "application/pdf" : "Binary file")}</span>
                </div>
              </div>

              <div className="meta-item">
                <HardDrive size={15} className="meta-icon" />
                <div>
                  <label>Size</label>
                  <span>{file.size}</span>
                </div>
              </div>

              <div className="meta-item">
                <Calendar size={15} className="meta-icon" />
                <div>
                  <label>Modified</label>
                  <span>{file.modified}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="secondary-button" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              onDownload?.(file);
            }}
          >
            <Download size={15} /> Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilePreviewModal;
