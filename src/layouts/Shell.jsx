import Sidebar from "../components/Sidebar.jsx"

export default function Shell({ children }) {
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr] bg-gray-50 text-slate-900">
      <Sidebar />
      <main className="p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
