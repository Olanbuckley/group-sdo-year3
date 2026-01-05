import Sidebar from "../components/Sidebar.jsx"

export default function Shell({ children }) {
  // I made this layout so every main page can share the same sidebar + spacing.
  // The children prop lets me place whatever page content I want inside the layout.
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr] bg-gray-50 text-slate-900">
      <Sidebar />

      {/* This is where the page content (children) is shown */}
      <main className="p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
