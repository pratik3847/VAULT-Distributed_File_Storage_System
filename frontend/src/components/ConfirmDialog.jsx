import { useEffect, useState } from "react";

function ConfirmDialog({ open, title, message, confirmLabel = "Delete", onConfirm, onCancel }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    setSubmitting(false);
  }, [open]);

  if (!open) {
    return null;
  }

  const handleConfirm = async () => {
    setSubmitting(true);
    setError("");

    try {
      await onConfirm();
      onCancel();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Action failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="confirm-backdrop"
      role="presentation"
      onClick={() => !submitting && onCancel()}
    >
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h3>{title}</h3>
        <p>{message}</p>

        {error ? <p className="dialog-error" style={{ marginBottom: "14px" }}>{error}</p> : null}

        <div className="confirm-actions">
          <button
            className="confirm-cancel"
            type="button"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className="confirm-delete"
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;