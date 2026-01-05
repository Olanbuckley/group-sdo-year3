import { NavLink, useNavigate } from "react-router-dom"

export default function Sidebar() {
  // I use useNavigate so I can send the user to another page with code (like on sign out).
  const navigate = useNavigate()

  // I keep my Tailwind classes in variables so my JSX stays cleaner.
  const base =
    "px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-700/60"
  const active = "bg-slate-700 text-white"

  // I read the role from localStorage because I store it after login.
  // I also clean it up so it's always lowercase and not messy.
  const role = (localStorage.getItem("role") || "").trim().toLowerCase()

  // These are the links doctors should see in the sidebar.
  const doctorLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/patients", label: "Patients" },
    { to: "/reports", label: "Reports" },
    { to: "/news", label: "News" },
    { to: "/settings", label: "Settings" },
  ]

  // These are the links admins should see.
  const adminLinks = [
    { to: "/admin", label: "Admin" },
    { to: "/support", label: "Support" },
    { to: "/reviews", label: "Ratings & Reviews" },
  ]

  // I choose the correct sidebar links depending on the role.
  const links = role === "admin" ? adminLinks : doctorLinks

  function signOut() {
    // I clear localStorage so the user is fully logged out.
    localStorage.clear()

    // I redirect back to login and replace the history so they can't hit back to return.
    navigate("/login", { replace: true })
  }

  return (
    <aside className="bg-slate-900 border-r border-slate-800 min-h-screen flex flex-col">
      <div className="px-4 py-5 text-white font-semibold">NMS-Web</div>

      {/* I map through the chosen links and create NavLinks for each page */}
      <nav className="flex flex-col gap-1 px-3 pb-6 flex-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            // I use isActive so I can style the currently selected page.
            className={({ isActive }) => (isActive ? `${base} ${active}` : base)}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* This is my sign out button at the bottom */}
      <div className="px-3 pb-6">
        <button
          onClick={signOut}
          className="w-full px-3 py-2 rounded-xl text-sm text-red-400 hover:text-white hover:bg-red-600/80 border border-red-500/30"
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}
