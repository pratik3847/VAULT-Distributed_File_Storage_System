import { useState } from "react";
import { Link } from "react-router-dom";

function Breadcrumbs({ items = [], onDropOnBreadcrumb }) {
  const [activeDragId, setActiveDragId] = useState(null);

  const handleDragOver = (e, item) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setActiveDragId(item.id);
  };

  const handleDragLeave = () => {
    setActiveDragId(null);
  };

  const handleDrop = (e, item) => {
    e.preventDefault();
    setActiveDragId(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json") || "{}");
      if (data && data.id) {
        const targetFolderId = item.id === "root" ? null : item.id;
        onDropOnBreadcrumb?.(data, targetFolderId);
      }
    } catch {}
  };

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isDragActive = activeDragId === item.id;

        return (
          <span
            className={`breadcrumb-item ${isDragActive ? "breadcrumb-drop-target" : ""}`}
            key={item.path ?? item.id ?? item.label}
            onDragOver={(e) => !isLast && handleDragOver(e, item)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => !isLast && handleDrop(e, item)}
          >
            {isLast ? (
              <span className="breadcrumb-current">{item.label}</span>
            ) : (
              <Link className="breadcrumb-link" to={item.path}>
                {item.label}
              </Link>
            )}

            {!isLast ? <span className="breadcrumb-separator">/</span> : null}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;