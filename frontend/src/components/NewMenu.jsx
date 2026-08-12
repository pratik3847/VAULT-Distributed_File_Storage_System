import { ChevronDown, FolderPlus, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function NewMenu({ onNewFolder, onUploadFiles, onUploadFolder }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleAction = async (callback) => {
    setOpen(false);

    if (callback) {
      await callback();
    }
  };

  return (
    <div className="new-wrapper" ref={menuRef}>
      <button className="new-button" type="button" onClick={() => setOpen((value) => !value)}>
        <FolderPlus size={16} />
        New
        <ChevronDown size={14} />
      </button>

      {open ? (
        <div className="new-menu" role="menu">
          <button type="button" className="new-menu-item" onClick={() => handleAction(onNewFolder)}>
            <FolderPlus size={14} />
            New folder
          </button>

          <button
            type="button"
            className="new-menu-item"
            onClick={() => handleAction(onUploadFiles)}
          >
            <Upload size={14} />
            Upload files
          </button>

          <button
            type="button"
            className="new-menu-item"
            onClick={() => handleAction(onUploadFolder)}
          >
            <Upload size={14} />
            Upload folder
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default NewMenu;