import { NavLink } from "react-router-dom"

export default function Sidebar() {
  const base =
    "px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-700/60"
  const active = "bg-slate-700 text-white"

  // get user role from login
  const role = localStorage.getItem("role") // "doctor" or "admin"

  return (
    <aside className="bg-slate-900 border-r border-slate-800 min-h-screen">
      <div className="px-4 py-5 text-white font-semibold">NMS-Web</div>

      <nav className="flex flex-col gap-1 px-3 pb-6">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? `${base} ${active}` : base
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/patients"
          className={({ isActive }) =>
            isActive ? `${base} ${active}` : base
          }
        >
          Patients
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            isActive ? `${base} ${active}` : base
          }
        >
          Reports
        </NavLink>

        <NavLink
          to="/news"
          className={({ isActive }) =>
            isActive ? `${base} ${active}` : base
          }
        >
          News
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive ? `${base} ${active}` : base
          }
        >
          Settings
        </NavLink>

        {/* ADMIN ONLY LINK — only visible if role === "admin" */}
        {role === "admin" && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              isActive ? `${base} ${active}` : base
            }
          >
            Admin
          </NavLink>
        )}
      </nav>
    </aside>
  )
}
