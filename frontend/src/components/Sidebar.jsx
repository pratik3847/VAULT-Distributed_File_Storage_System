import {
  Archive,
  ChevronDown,
  Folder,
  HardDrive,
  LayoutDashboard,
  Settings,
  Star,
  Trash2,
  Users,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { listFilesRequest } from "../services/api";

const TOTAL_QUOTA_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB quota

function formatBytes(value) {
  if (!value) return "0 B";
  if (value < 1024) return `${value} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let size = value / 1024;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function Sidebar() {
  const [totalStorageUsed, setTotalStorageUsed] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    listFilesRequest()
      .then((res) => {
        if (!isMounted) return;
        const files = res.data.data || [];
        const used = files.reduce((acc, file) => acc + (file.size || 0), 0);
        setTotalStorageUsed(used);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const percentage = Math.min(
    100,
    Math.max(1, Math.round((totalStorageUsed / TOTAL_QUOTA_BYTES) * 100))
  );

  return (
    <>
      <div className="brand-bar">
        <div className="brand">
          <div className="brand-mark">V</div>
          <span>Vault</span>
        </div>

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={`sidebar-body ${mobileOpen ? "mobile-expanded" : ""}`}>
        <div className="workspace">
          <span>PERSONAL WORKSPACE</span>
          <ChevronDown size={14} />
        </div>

        <nav className="navigation">
          <p className="nav-label">Workspace</p>

          <NavItem
            icon={<LayoutDashboard size={17} />}
            number="01"
            label="Overview"
            to="/dashboard"
            end
            onClick={() => setMobileOpen(false)}
          />

          <NavItem
            icon={<Folder size={17} />}
            number="02"
            label="My files"
            to="/files"
            onClick={() => setMobileOpen(false)}
          />

          <NavItem
            icon={<Archive size={17} />}
            number="03"
            label="Recent"
            to="/recent"
            onClick={() => setMobileOpen(false)}
          />

          <NavItem
            icon={<Star size={17} />}
            number="04"
            label="Starred"
            to="/starred"
            onClick={() => setMobileOpen(false)}
          />

          <NavItem
            icon={<Trash2 size={17} />}
            number="05"
            label="Trash"
            to="/trash"
            onClick={() => setMobileOpen(false)}
          />

          <p className="nav-label nav-label-spaced">System</p>

          <NavItem
            icon={<Users size={17} />}
            label="Shared"
            to="/shared"
            onClick={() => setMobileOpen(false)}
          />
          <NavItem
            icon={<Settings size={17} />}
            label="Settings"
            to="/settings"
            onClick={() => setMobileOpen(false)}
          />
        </nav>

        <div className="storage-card">
          <div className="storage-heading">
            <span>Storage</span>
            <HardDrive size={15} />
          </div>

          <div className="storage-number">
            <strong>{formatBytes(totalStorageUsed)}</strong>
            <span> / 10 GB</span>
          </div>

          <div className="storage-bar">
            <div
              className="storage-progress"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p>{formatBytes(TOTAL_QUOTA_BYTES - totalStorageUsed)} remaining</p>
        </div>
      </div>
    </>
  );
}

function NavItem({
  icon,
  number,
  label,
  active = false,
  to = null,
  end = false,
  onClick,
}) {
  if (to) {
    return (
      <NavLink
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        to={to}
        end={end}
        onClick={onClick}
      >
        {number && <span className="nav-number">{number}</span>}
        <span className="nav-icon">{icon}</span>
        <span>{label}</span>
      </NavLink>
    );
  }

  return (
    <button
      className={`nav-item ${active ? "active" : ""}`}
      onClick={onClick}
      type="button"
    >
      {number && <span className="nav-number">{number}</span>}
      <span className="nav-icon">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default Sidebar;