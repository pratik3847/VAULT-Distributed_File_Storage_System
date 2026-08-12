import { Check, Loader2, RotateCw, XCircle } from "lucide-react";

function UploadProgress({ upload, onRetry }) {
  return (
    <div className="upload-progress-item">
      <div className="upload-progress-meta">
        <div>
          <strong>{upload.name}</strong>
          <span>
            {upload.status === "uploading"
              ? `${upload.completedChunks} / ${upload.totalChunks} chunks`
              : upload.status === "completed"
                ? "Upload complete"
                : upload.error || "Queued"}
          </span>
        </div>

        <span className={`upload-status ${upload.status}`}>
          {upload.status === "uploading" ? (
            <Loader2 size={14} />
          ) : upload.status === "completed" ? (
            <Check size={14} />
          ) : upload.status === "failed" ? (
            <XCircle size={14} />
          ) : null}
          {upload.status}
        </span>
      </div>

      <div className="upload-progress-bar">
        <span style={{ width: `${upload.progress}%` }} />
      </div>

      <div className="upload-progress-footnote">
        <span>{upload.progress}%</span>
        <span>{upload.progressLabel}</span>
      </div>

      {upload.status === "failed" ? (
        <button className="upload-retry" type="button" onClick={() => onRetry(upload.id)}>
          <RotateCw size={14} />
          Retry
        </button>
      ) : null}
    </div>
  );
}

export default UploadProgress;