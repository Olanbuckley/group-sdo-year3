import { useEffect, useState } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import { getPatientsByDoctor } from "../api/api.js"

export default function Patients() {
  // I use navigate so I can send the user to the patient profile when they click a row.
  const nav = useNavigate()

  // I store the patients list in state so the table updates after loading.
  const [patients, setPatients] = useState([])

  // This is for the search box.
  const [query, setQuery] = useState("")

  // I use these for loading and error messages.
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  // I read role and doctorId from localStorage because they are set when the user logs in.
  const role = (localStorage.getItem("role") || "").trim().toLowerCase()
  let doctorId = localStorage.getItem("doctorId") || ""

  // Sometimes doctorId might get stored with extra text like "/doctors/..."
  // so I clean it to keep only the real id.
  doctorId = doctorId.replace(/^\/?doctors\//, "").replace(/^\/doctors\//, "")

  // I protect this page:
  // - admins should not be on the patients list page
  // - doctors need a doctorId to load their patients
  if (role === "admin") return <Navigate to="/admin" replace />
  if (!doctorId) return <Navigate to="/login" replace />

  function normalizePatients(data) {
    // I added this because the backend might return an array,
    // or it might return an object where the keys are firebase ids.
    if (Array.isArray(data)) return data

    if (data && typeof data === "object") {
      // This turns the object into an array and keeps the key as the id.
      return Object.entries(data).map(([id, value]) => ({ id, ...value }))
    }

    // If data is empty or weird, I just return an empty list.
    return []
  }

  useEffect(() => {
    async function load() {
      // Before loading, I clear old errors and show the loading message.
      setError("")
      setLoading(true)

      try {
        // I load patients for this doctor from the backend.
        const res = await getPatientsByDoctor(doctorId)
        const list = normalizePatients(res.data)

        // I clean the data so the UI always has the same fields to use.
        const cleaned = list.map((p) => ({
          id: p.id || p._id, // this is the patient id I use for opening their profile page
          firstName: p.firstName ?? p.first_name ?? "",
          lastName: p.lastName ?? p.last_name ?? "",
          age: p.age ?? "N/A",
          gender: p.gender ?? "N/A",
          notes: p.notes ?? "",
          createdAt: p.createdAt ?? "N/A",
        }))

        setPatients(cleaned)
      } catch (err) {
        console.error(err)

        // I keep the error message simple so it is clear what went wrong.
        setError("Unable to load patients (check /patients/by_doctor/<doctorId> in Network tab).")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [doctorId])

  // I filter the list using the search text the user types.
  const filtered = patients.filter((p) => {
    const name = `${p.firstName} ${p.lastName}`.toLowerCase()
    return name.includes(query.toLowerCase())
  })

  if (loading) return <div className="text-sm text-slate-500">Loading...</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Patients</h1>

        {/* This input is just for searching by patient name */}
        <input
          type="text"
          placeholder="Search name..."
          className="rounded-xl border border-slate-300 px-3 py-2 bg-white"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

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
                // When I click a row, I open that patient's profile page.
                onClick={() => nav(`/patients/${p.id}`)}
              >
                <td className="p-3">
                  {p.firstName} {p.lastName}
                </td>
                <td className="p-3">{p.age}</td>
                <td className="p-3">{p.gender}</td>
                <td className="p-3 text-slate-500">{String(p.createdAt)}</td>
              </tr>
            ))}

            {/* If no patients match the search, I show a simple message */}
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
