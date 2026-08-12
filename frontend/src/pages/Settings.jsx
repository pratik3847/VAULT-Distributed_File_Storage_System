import AppLayout from "../layouts/AppLayout";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import useAuth from "../hooks/useAuth";

function Settings() {
  const { user, logout } = useAuth();

  return (
    <AppLayout sidebar={<Sidebar />} topbar={<Topbar title="Settings" />}>
      <section className="settings-panel">
        <div>
          <p className="section-index">PROFILE</p>
          <h2>{user?.name || "Vault user"}</h2>
          <p className="settings-copy">{user?.email || "Signed in session"}</p>
        </div>

        <button className="auth-button settings-logout" type="button" onClick={logout}>
          Log out
        </button>
      </section>
    </AppLayout>
  );
}

export default Settings;