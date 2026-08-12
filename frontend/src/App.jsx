import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import MyFiles from "./pages/MyFiles";
import Recent from "./pages/Recent";
import Settings from "./pages/Settings";
import Shared from "./pages/Shared";
import Signup from "./pages/Signup";
import Starred from "./pages/Starred";
import Trash from "./pages/Trash";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/files"
        element={
          <ProtectedRoute>
            <MyFiles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/files/:folderId"
        element={
          <ProtectedRoute>
            <MyFiles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recent"
        element={
          <ProtectedRoute>
            <Recent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/starred"
        element={
          <ProtectedRoute>
            <Starred />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trash"
        element={
          <ProtectedRoute>
            <Trash />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shared"
        element={
          <ProtectedRoute>
            <Shared />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;