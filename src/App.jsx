import { Routes, Route, Navigate } from "react-router-dom";
import Shell from "./layouts/Shell.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Patients from "./pages/Patients.jsx";
import PatientProfile from "./pages/PatientProfile.jsx";
import Reports from "./pages/Reports.jsx";
import News from "./pages/News.jsx";
import Settings from "./pages/Settings.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <Shell>
            <Dashboard />
          </Shell>
        }
      />
      <Route
        path="/patients"
        element={
          <Shell>
            <Patients />
          </Shell>
        }
      />
      <Route
        path="/patients/:id"
        element={
          <Shell>
            <PatientProfile />
          </Shell>
        }
      />
      <Route
        path="/reports"
        element={
          <Shell>
            <Reports />
          </Shell>
        }
      />
      <Route
        path="/news"
        element={
          <Shell>
            <News />
          </Shell>
        }
      />
      <Route
        path="/settings"
        element={
          <Shell>
            <Settings />
          </Shell>
        }
      />
      <Route
        path="/admin"
        element={
          <Shell>
            <Admin />
          </Shell>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
