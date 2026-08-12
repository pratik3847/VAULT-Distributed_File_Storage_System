import { useEffect, useState } from "react";
import { X, Trash2, Search, UserCheck } from "lucide-react";
import {
  searchUsersRequest,
  shareFileRequest,
  getFileSharesRequest,
  unshareFileRequest,
} from "../services/api";
import { useToast } from "../context/ToastContext";

function ShareModal({ open, item, onClose }) {
  const { showSuccess, showError } = useToast();
  const [query, setQuery] = useState("");
  const [searchHits, setSearchHits] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [shares, setShares] = useState([]);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!open || !item) return;

    setQuery("");
    setSearchHits([]);
    setSelectedUser(null);

    // Fetch existing shares for this file
    getFileSharesRequest(item.id)
      .then((res) => {
        setShares(res.data.data || []);
      })
      .catch(() => {});
  }, [open, item]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchHits([]);
      return;
    }

    const timer = setTimeout(() => {
      searchUsersRequest(query)
        .then((res) => {
          setSearchHits(res.data.data || []);
        })
        .catch(() => {});
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!open || !item) return null;

  const handleShare = async () => {
    if (!selectedUser) return;

    setSharing(true);
    try {
      await shareFileRequest(item.id, {
        userId: selectedUser.id,
        permission: "VIEWER",
      });

      showSuccess(`File shared with ${selectedUser.name}`);
      setSelectedUser(null);
      setQuery("");

      // Refresh shares list
      const res = await getFileSharesRequest(item.id);
      setShares(res.data.data || []);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to share file.");
    } finally {
      setSharing(false);
    }
  };

  const handleUnshare = async (targetUserId, userName) => {
    try {
      await unshareFileRequest(item.id, targetUserId);
      showSuccess(`Revoked access for ${userName}`);
      setShares((prev) => prev.filter((s) => s.user.id !== targetUserId));
    } catch {
      showError("Failed to revoke access.");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card share-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Share "{item.name}"</h3>
            <p className="muted">Share this file with another user for download access</p>
          </div>
          <button className="modal-close" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* User Search Input */}
          <div className="share-search-section">
            <label className="input-label">Add people</label>
            <div className="search-input-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedUser(null);
                }}
              />
            </div>

            {/* Search results dropdown */}
            {searchHits.length > 0 && !selectedUser && (
              <div className="user-search-dropdown">
                {searchHits.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className="user-search-item"
                    onClick={() => {
                      setSelectedUser(user);
                      setQuery(user.name);
                    }}
                  >
                    <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                    <div className="user-info">
                      <strong className="user-name">{user.name}</strong>
                      <span className="user-email">{user.email}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected User Action Bar */}
          {selectedUser && (
            <div className="selected-user-bar">
              <div className="selected-user-info">
                <UserCheck size={18} className="text-indigo" />
                <div>
                  <strong>{selectedUser.name}</strong>
                  <span className="muted block">{selectedUser.email}</span>
                </div>
              </div>

              <button
                type="button"
                className="primary-button"
                disabled={sharing}
                onClick={handleShare}
              >
                {sharing ? "Sharing..." : "Share"}
              </button>
            </div>
          )}

          {/* People with Access */}
          <div className="access-section">
            <h4>People with access</h4>

            <div className="access-list">
              <div className="access-item">
                <div className="user-avatar owner-avatar">You</div>
                <div className="user-info">
                  <strong>You</strong>
                  <span className="muted">Owner</span>
                </div>
                <span className="badge owner-badge">Owner</span>
              </div>

              {shares.map((share) => (
                <div key={share.id} className="access-item">
                  <div className="user-avatar">{share.user.name.charAt(0).toUpperCase()}</div>
                  <div className="user-info">
                    <strong>{share.user.name}</strong>
                    <span className="muted">{share.user.email}</span>
                  </div>

                  <button
                    type="button"
                    className="icon-button-danger"
                    title="Remove access"
                    onClick={() => handleUnshare(share.user.id, share.user.name)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="secondary-button" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
