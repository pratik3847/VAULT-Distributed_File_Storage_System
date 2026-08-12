import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import FileTable from "../components/FileTable";
import LoadingState from "../components/LoadingState";
import FilePreviewModal from "../components/FilePreviewModal";
import ShareModal from "../components/ShareModal";
import { getStarredItemsRequest, downloadFileRequest, toggleStarFileRequest, toggleStarFolderRequest } from "../services/api";

function Starred() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [sharingItem, setSharingItem] = useState(null);

  const fetchStarred = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getStarredItemsRequest();
      const { files = [], folders = [] } = res.data.data || {};
      const normalizedFolders = folders.map((f) => ({
        id: f.id,
        kind: "folder",
        name: f.name,
        modified: new Date(f.updatedAt).toLocaleDateString(),
        size: "—",
        isStarred: true,
        raw: f,
      }));
      const normalizedFiles = files.map((f) => ({
        id: f.id,
        kind: "file",
        name: f.originalName,
        modified: new Date(f.updatedAt).toLocaleDateString(),
        size: `${(f.size / 1024).toFixed(1)} KB`,
        mimeType: f.mimeType,
        isStarred: true,
        raw: f,
      }));

      setItems([...normalizedFolders, ...normalizedFiles]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load starred items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStarred();
  }, []);

  const handleUnstar = async (item) => {
    if (item.kind === "folder") {
      await toggleStarFolderRequest(item.id);
    } else {
      await toggleStarFileRequest(item.id);
    }
    fetchStarred();
  };

  const handleDownload = async (file) => {
    const response = await downloadFileRequest(file.id);
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(blobUrl);
  };

  return (
    <AppLayout sidebar={<Sidebar />} topbar={<Topbar title="Starred" />}>
      <section className="files-shell">
        {loading ? <LoadingState label="Loading starred items..." /> : null}

        {!loading && error ? <div className="status-state error">{error}</div> : null}

        {!loading && !error ? (
          items.length ? (
            <FileTable
              files={items}
              onDownloadFile={handleDownload}
              onStarItem={handleUnstar}
              onShareItem={(file) => setSharingItem(file)}
              onPreviewFile={(file) => setPreviewFile(file)}
            />
          ) : (
            <div className="empty-state">
              <h3>No starred items yet</h3>
              <p>Click the star icon next to any file or folder to keep them handy here.</p>
            </div>
          )
        ) : null}
      </section>

      <FilePreviewModal
        open={Boolean(previewFile)}
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={handleDownload}
      />

      <ShareModal
        open={Boolean(sharingItem)}
        item={sharingItem}
        onClose={() => setSharingItem(null)}
      />
    </AppLayout>
  );
}

export default Starred;