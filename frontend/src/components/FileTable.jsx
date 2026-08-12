import {
  FileText,
  Folder,
  MoreVertical,
  Download,
  Pencil,
  Trash2,
  Share2,
  Star,
  FolderOutput,
  Eye,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

function FileTable({
  files = [],
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  onOpenFolder,
  onDownloadFile,
  onRenameItem,
  onDeleteItem,
  onMoveItem,
  onStarItem,
  onShareItem,
  onDropOnFolder,
  onPreviewFile,
}) {
  const allSelected =
    files.length > 0 && files.every((item) => selectedIds.includes(item.id));

  return (
    <section className="file-panel">
      <div className="table-header">
        <div className="checkbox-cell">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onSelectAll?.(e.target.checked)}
          />
        </div>
        <span>Name</span>
        <span>Modified</span>
        <span>Size</span>
        <span />
      </div>

      {files.map((file, index) => (
        <FileRow
          key={file.id ?? `${file.name}-${index}`}
          file={file}
          index={index}
          isSelected={selectedIds.includes(file.id)}
          onToggleSelect={onToggleSelect}
          onOpenFolder={onOpenFolder}
          onDownloadFile={onDownloadFile}
          onRenameItem={onRenameItem}
          onDeleteItem={onDeleteItem}
          onMoveItem={onMoveItem}
          onStarItem={onStarItem}
          onShareItem={onShareItem}
          onDropOnFolder={onDropOnFolder}
          onPreviewFile={onPreviewFile}
        />
      ))}
    </section>
  );
}

function FileRow({
  file,
  index,
  isSelected,
  onToggleSelect,
  onOpenFolder,
  onDownloadFile,
  onRenameItem,
  onDeleteItem,
  onMoveItem,
  onStarItem,
  onShareItem,
  onDropOnFolder,
  onPreviewFile,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const menuRef = useRef(null);
  const isFolder = file.kind === "folder" || file.type === "folder";
  const isStarred = file.isStarred || file.raw?.isStarred;

  // Compute folder item count display if applicable
  const displaySize = isFolder
    ? file.raw?._count
      ? `${(file.raw._count.children || 0) + (file.raw._count.files || 0)} items`
      : "—"
    : file.size;

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Drag Handlers
  const handleDragStart = (event) => {
    event.dataTransfer.setData("application/json", JSON.stringify({ id: file.id, kind: file.kind, name: file.name }));
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event) => {
    if (!isFolder) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    if (!isFolder) return;
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    if (!isFolder) return;
    event.preventDefault();
    setIsDragOver(false);
    try {
      const data = JSON.parse(event.dataTransfer.getData("application/json") || "{}");
      if (data && data.id && data.id !== file.id) {
        onDropOnFolder?.(data, file);
      }
    } catch {
    }
  };

  const menuItems = [
    ...(isFolder
      ? [
          { label: "Open", icon: Folder, action: () => onOpenFolder?.(file) },
          { label: "Rename", icon: Pencil, action: () => onRenameItem?.(file) },
          { label: "Move", icon: FolderOutput, action: () => onMoveItem?.(file) },
          { label: "Delete", icon: Trash2, action: () => onDeleteItem?.(file) },
        ]
      : [
          { label: "Preview", icon: Eye, action: () => onPreviewFile?.(file) },
          { label: "Share", icon: Share2, action: () => onShareItem?.(file) },
          { label: "Download", icon: Download, action: () => onDownloadFile?.(file) },
          { label: "Rename", icon: Pencil, action: () => onRenameItem?.(file) },
          { label: "Move", icon: FolderOutput, action: () => onMoveItem?.(file) },
          { label: "Delete", icon: Trash2, action: () => onDeleteItem?.(file) },
        ]),
  ];

  return (
    <div
      className={`file-row ${isSelected ? "selected" : ""} ${isDragOver ? "drag-target-active" : ""}`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect?.(file)}
        />
      </div>

      <div className="file-name-cell flex-1">
        <button
          className="star-button"
          type="button"
          title={isStarred ? "Unstar" : "Star"}
          onClick={(e) => {
            e.stopPropagation();
            onStarItem?.(file);
          }}
        >
          <Star size={15} className={isStarred ? "starred-icon" : "unstarred-icon"} />
        </button>

        <button
          className="file-name-button"
          type="button"
          onClick={() => (isFolder ? onOpenFolder?.(file) : onPreviewFile?.(file))}
        >
          <span className="row-number">{String(index + 1).padStart(3, "0")}</span>

          <div className={`file-icon ${isFolder ? "folder" : ""}`}>
            {isFolder ? <Folder size={17} /> : <FileText size={17} />}
          </div>

          <span className="file-title-text">{file.name}</span>
        </button>
      </div>

      <span className="muted">{file.modified}</span>

      <span className="muted mono">{displaySize}</span>

      <div className="row-actions-wrap" ref={menuRef}>
        <button
          className="row-menu"
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <MoreVertical size={16} />
        </button>

        {menuOpen ? (
          <div className="row-menu-panel">
            {menuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className="row-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  item.action?.();
                }}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default FileTable;