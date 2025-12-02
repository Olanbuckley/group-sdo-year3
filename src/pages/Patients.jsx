import { useEffect, useState } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import { getPatientsByDoctor } from "../api/api.js"

export default function Patients() {
  const nav = useNavigate()
  const [patients, setPatients] = useState([])
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  // doctorId stored at login
  const doctorId = localStorage.getItem("doctorId")

  // If not logged in → redirect
  if (!doctorId) return <Navigate to="/login" replace />

  useEffect(() => {
    async function load() {
      try {
        const res = await getPatientsByDoctor(doctorId)
        const list = Array.isArray(res.data) ? res.data : []

        // Clean + safe mapping
        const cleaned = list.map((p) => ({
          id: p.id || p._id,
          firstName: p.firstName || "",
          lastName: p.lastName || "",
          age: p.age ?? "N/A",
          gender: p.gender || "N/A",
          notes: p.notes || "",
          createdAt: p.createdAt || "N/A"
        }))

        setPatients(cleaned)
      } catch {
        setError("Unable to load patients")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [doctorId])

  // Search filter
  const filtered = patients.filter((p) => {
    const name = `${p.firstName} ${p.lastName}`.toLowerCase()
    return name.includes(query.toLowerCase())
  })

  if (loading) return <div className="text-sm text-slate-500">Loading...</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      
      {/* Header + Search */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Patients</h1>

        <input
          type="text"
          placeholder="Search name..."
          className="rounded-xl border border-slate-300 px-3 py-2 bg-white"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Age</th>
              <th className="p-3 text-left">Gender</th>
              <th className="p-3 text-left">Created</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-slate-50 cursor-pointer"
                onClick={() => nav(`/patients/${p.id}`)}
              >
                <td className="p-3">{p.firstName} {p.lastName}</td>
                <td className="p-3">{p.age}</td>
                <td className="p-3">{p.gender}</td>
                <td className="p-3 text-slate-500">{String(p.createdAt)}</td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-6 text-slate-500">
                  No matching patients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
