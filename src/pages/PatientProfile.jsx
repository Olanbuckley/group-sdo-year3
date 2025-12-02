import { useEffect, useState } from "react"
import { useParams, Navigate } from "react-router-dom"
import { getPatient, getLatestRiskScore } from "../api/api"

export default function PatientProfile() {
  const { id } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [details, setDetails] = useState(null)

  // secure page
  const doctorId = localStorage.getItem("doctorId")
  if (!doctorId) return <Navigate to="/login" replace />

  useEffect(() => {
    async function load() {
      try {
        const res = await getPatient(id)
        const p = res.data || {}

        setDetails({
          firstName: p.firstName || "",
          lastName: p.lastName || "",
          age: p.age ?? "N/A",
          gender: p.gender || "N/A",
          notes: p.notes || "No notes provided",
          createdAt: p.createdAt || "N/A"
        })
      } catch {
        setError("Unable to load patient data")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  if (loading) return <div className="text-sm text-slate-500">Loading...</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>
  if (!details) return null

  const fullName = `${details.firstName} ${details.lastName}`

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Patient Profile</h1>
        <div className="text-sm border border-slate-300 rounded-full px-3 py-1 bg-white text-slate-600">
          ID: {id}
        </div>
      </div>

      {/* Patient Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold mb-3">Patient Details</h2>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><span className="font-medium">Name:</span> {fullName}</p>
            <p><span className="font-medium">Age:</span> {details.age}</p>
            <p><span className="font-medium">Gender:</span> {details.gender}</p>
            <p><span className="font-medium">Created:</span> {String(details.createdAt)}</p>
          </div>

          <div>
            <p className="font-medium mb-1">Doctor Notes:</p>
            <p className="text-slate-600">{details.notes}</p>
          </div>
        </div>
      </div>

      {/* Risk Scores Placeholder */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold mb-3">Risk Scores</h2>
        <p className="text-sm text-slate-500">
          Risk score history will appear here once Cullain enables
          <span className="font-medium"> /patients/{id}/riskScores </span> 
          in the backend API.
        </p>
      </div>

    </div>
  )
}
