import { useEffect, useState } from "react";

function FolderDialog({
  open,
  title,
  initialValue = "",
  submitLabel = "Save",
  onSubmit,
  onClose,
}) {
  const [name, setName] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(initialValue);
    setError("");
    setSubmitting(false);
  }, [initialValue, open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Folder name is required.");
      return;
    }

    if (trimmed.length > 100) {
      setError("Folder name cannot exceed 100 characters.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await onSubmit(trimmed);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "An error occurred."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="confirm-backdrop"
      role="presentation"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h3>{title}</h3>

        <form className="dialog-form" onSubmit={handleSubmit}>
          <input
            className="dialog-input"
            type="text"
            placeholder="Folder name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            disabled={submitting}
          />

          {error ? <p className="dialog-error">{error}</p> : null}

          <div className="confirm-actions">
            <button
              className="confirm-cancel"
              type="button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className="dialog-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FolderDialog;
