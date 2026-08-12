import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import NewMenu from "./NewMenu";

function getFormattedDate() {
  const date = new Date();
  const dayStr = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const dayNum = date.getDate();
  const monthStr = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const yearNum = date.getFullYear();
  return `${dayStr} ${dayNum} ${monthStr} ${yearNum} — YOUR WORKSPACE`;
}

function getInitials(name) {
  if (!name) return "V";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function Topbar({ eyebrow, title = "Overview", newMenu = null, onOpenUpload }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayEyebrow = eyebrow || getFormattedDate();
  const initials = getInitials(user?.name);

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{displayEyebrow}</p>
        <h1>{title}</h1>
      </div>

      <div className="topbar-actions">
        <button
          className="icon-button"
          type="button"
          title="Search files"
          onClick={() => navigate("/files")}
        >
          <Search size={17} />
        </button>

        <button
          className="avatar"
          type="button"
          title="Profile & Settings"
          onClick={() => navigate("/settings")}
        >
          {initials}
        </button>

        {newMenu ?? (
          <NewMenu
            onNewFolder={() => navigate("/files")}
            onUploadFiles={onOpenUpload || (() => navigate("/files"))}
            onUploadFolder={onOpenUpload || (() => navigate("/files"))}
          />
        )}
      </div>
    </header>
  );
}

export default Topbar;