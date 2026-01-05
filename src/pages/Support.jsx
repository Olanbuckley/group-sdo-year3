import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import {
  getAllSupportTickets,
  deleteSupportTicket,
} from "../api/api.js"

export default function Support() {
  // I only want admins to see this page, so I check the role first.
  const role = (localStorage.getItem("role") || "").trim().toLowerCase()
  if (role !== "admin") {
    return <Navigate to="/login" replace />
  }

  // This stores all the support tickets from the backend.
  const [tickets, setTickets] = useState([])

  // I use these to show loading and error messages.
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  function normalize(data) {
    // The backend sometimes sends back an array and sometimes an object,
    // so I convert everything into a normal array here.
    if (Array.isArray(data)) return data

    if (data && typeof data === "object") {
      return Object.entries(data).map(([id, value]) => ({
        id, // I keep the id so I can delete the ticket later.
        ...value,
      }))
    }

    return []
  }

  async function loadTickets() {
    // This loads all the support tickets when the page opens.
    setLoading(true)
    setError("")

    try {
      const res = await getAllSupportTickets()
      setTickets(normalize(res.data))
    } catch (err) {
      console.error(err)
      setError("Unable to load support tickets.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // I run this once when the page first loads.
    loadTickets()
  }, [])

  async function removeTicket(id) {
    // I ask for confirmation so tickets are not deleted by accident.
    const confirmed = window.confirm("Delete this support ticket?")
    if (!confirmed) return

    try {
      await deleteSupportTicket(id)

      // I update the screen straight away by removing the deleted ticket.
      setTickets((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error(err)
      alert("Delete failed — check Network tab for endpoint.")
    }
  }

  if (loading) {
    return <div className="text-sm text-slate-500">Loading...</div>
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Support Tickets</h1>

        {/* This reloads the tickets if I want to refresh the list */}
        <button
          onClick={loadTickets}
          className="rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-3 text-left">Issue</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {tickets.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="p-3 text-slate-900">
                  {t.supportIssue || "(no issue provided)"}
                </td>

                <td className="p-3">
                  <button
                    onClick={() => removeTicket(t.id)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-xl hover:bg-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {tickets.length === 0 && (
              <tr>
                <td colSpan="2" className="text-center py-6 text-slate-500">
                  No support tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
