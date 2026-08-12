import { useEffect, useState } from "react";
import { Download, FileText, UserCheck } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingState from "../components/LoadingState";
import { getSharedWithMeRequest, downloadFileRequest } from "../services/api";
import { useToast } from "../context/ToastContext";

function Shared() {
  const { showSuccess, showError } = useToast();
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchShared = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getSharedWithMeRequest();
      setSharedFiles(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load shared files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShared();
  }, []);

  const handleDownload = async (file) => {
    try {
      const fileId = file.fileId || file.id;
      const response = await downloadFileRequest(fileId);
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const anchor = document.createElement("a");

      anchor.href = blobUrl;
      anchor.download = file.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(blobUrl);
      showSuccess(`Downloading ${file.name}`);
    } catch {
      showError("Download failed.");
    }
  };

  return (
    <AppLayout sidebar={<Sidebar />} topbar={<Topbar title="Shared with me" />}>
      <section className="files-shell">
        <div className="section-header">
          <div>
            <h2>Files Shared With You</h2>
          </div>
        </div>

        {loading ? <LoadingState label="Loading shared files..." /> : null}

        {!loading && error ? <div className="status-state error">{error}</div> : null}

        {!loading && !error ? (
          sharedFiles.length ? (
            <div className="shared-grid">
              {sharedFiles.map((item) => (
                <div key={item.fileId || item.id} className="shared-card">
                  <div className="shared-card-header">
                    <div className="file-icon">
                      <FileText size={22} />
                    </div>
                  </div>

                  <div className="shared-card-body">
                    <h4 className="shared-file-title" title={item.name}>{item.name}</h4>
                    <div className="shared-by-info">
                      <UserCheck size={14} className="text-indigo" />
                      <span>Shared by <strong>{item.sharedBy?.name || "User"}</strong></span>
                    </div>
                  </div>

                  <div className="shared-card-footer">
                    <button
                      type="button"
                      className="icon-text-btn primary"
                      onClick={() => handleDownload(item)}
                    >
                      <Download size={14} /> Download File
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No shared files yet</h3>
              <p>Files shared with you will appear here for direct download.</p>
            </div>
          )
        ) : null}
      </section>
    </AppLayout>
  );
}

export default Shared;
