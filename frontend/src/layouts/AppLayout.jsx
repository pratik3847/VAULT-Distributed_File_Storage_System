function AppLayout({ sidebar, topbar, children }) {
  return (
    <div className="vault-app">
      <aside className="sidebar">{sidebar}</aside>

      <main className="main-content">
        {topbar}
        {children}
      </main>
    </div>
  );
}

export default AppLayout;