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
import Support from "./pages/Support.jsx";
import Reviews from "./pages/Reviews.jsx";

export default function App() {
  return (
    <Routes>
      {/* When someone goes to / I just send them to the login page */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* These pages do not use the sidebar layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* All pages below are wrapped in Shell so they get the sidebar */}
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

      {/* This page shows a single patient using the id in the URL */}
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

      {/* Admin pages also use the same Shell layout */}
      <Route
        path="/admin"
        element={
          <Shell>
            <Admin />
          </Shell>
        }
      />

      <Route
        path="/support"
        element={
          <Shell>
            <Support />
          </Shell>
        }
      />

      <Route
        path="/reviews"
        element={
          <Shell>
            <Reviews />
          </Shell>
        }
      />

      {/* If someone types a random URL, I just send them back to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
