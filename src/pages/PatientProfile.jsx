import { useEffect, useMemo, useState } from "react"
import { useParams, Navigate, useNavigate } from "react-router-dom"
import {
  getPatient,
  updatePatient,
  deletePatient,
  getLatestRiskScore,
  getRiskScoresByPatient,
} from "../api/api"

// Recharts chart components used for the risk trend graph
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

export default function PatientProfile() {
  // Get the patient id from the URL
  const { id } = useParams()

  // Used for redirecting after delete
  const nav = useNavigate()

  // Loading and error state for patient profile
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [details, setDetails] = useState(null)

  // Edit mode and form state
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    notes: "",
  })

  // Latest risk score loading and data
  const [riskLoading, setRiskLoading] = useState(true)
  const [riskError, setRiskError] = useState("")
  const [latestRisk, setLatestRisk] = useState(null)

  // Risk history loading and data for trend chart
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState("")
  const [riskHistory, setRiskHistory] = useState([])

  // Pull auth info from localStorage
  const doctorId = localStorage.getItem("doctorId")
  const role = (localStorage.getItem("role") || "").trim().toLowerCase()
  const isAuthed = Boolean(doctorId) || role === "admin"

  // -----------------------------
  // Helper functions
  // -----------------------------

  // Normalize risk strings so "High Risk", "high-risk", etc all compare the same
  const normalizeRisk = (v) =>
    String(v || "")
      .trim()
      .toLowerCase()
      .replace(" risk", "")
      .replaceAll("_", "")
      .replaceAll("-", "")

  // Return a color based on the risk level
  const riskColor = (riskLevel) => {
    const r = normalizeRisk(riskLevel)
    if (r === "high") return "#ef4444"
    if (r === "medium") return "#f59e0b"
    if (r === "low") return "#10b981"
    return "#6366f1"
  }

  // Try to parse a date string into a Date object
  const parseDateValue = (value) => {
    if (!value) return null

    const d1 = new Date(value)
    if (!isNaN(d1.getTime())) return d1

    return null
  }

  // Format a date for short display on the chart
  const formatDateShort = (value) => {
    const d = parseDateValue(value)
    if (d) {
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short" })
    }
    return String(value || "N/A").slice(0, 16)
  }

  // -----------------------------
  // Load patient details
  // -----------------------------
  useEffect(() => {
    async function load() {
      try {
        const res = await getPatient(id)
        const p = res.data || {}

        // Map backend response into a clean object
        const mapped = {
          firstName: p.firstName || "",
          lastName: p.lastName || "",
          age: p.age ?? "",
          gender: p.gender || "",
          notes: p.notes || "",
          createdAt: p.createdAt || "N/A",
        }

        setDetails(mapped)

        // Pre-fill edit form with patient data
        setEditForm({
          firstName: mapped.firstName,
          lastName: mapped.lastName,
          age: mapped.age,
          gender: mapped.gender,
          notes: mapped.notes,
        })
      } catch (err) {
        console.error(err)
        setError("Unable to load patient data")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  // -----------------------------
  // Load latest risk score
  // -----------------------------
  useEffect(() => {
    async function loadLatestRisk() {
      setRiskError("")
      setRiskLoading(true)

      try {
        const res = await getLatestRiskScore(id)

        // Latest endpoint wraps the object in res.data.data
        const latest = res?.data?.data || null

        if (!latest) {
          setLatestRisk(null)
        } else {
          setLatestRisk({
            riskLevel: latest.riskLevel ?? "N/A",
            riskScore: latest.riskScore ?? "N/A",
            assessmentDate: latest.assessmentDate || latest.createdAt || "N/A",
            familyHistory: latest.familyHistory ?? "N/A",
            createdAt: latest.createdAt || "N/A",
          })
        }
      } catch (err) {
        console.error(err)
        setLatestRisk(null)
        setRiskError("No risk scores found for this patient.")
      } finally {
        setRiskLoading(false)
      }
    }

    loadLatestRisk()
  }, [id])

  // -----------------------------
  // Load full risk history for trend chart
  // -----------------------------
  useEffect(() => {
    async function loadHistory() {
      setHistoryError("")
      setHistoryLoading(true)

      try {
        const res = await getRiskScoresByPatient(id)

        // Extract array from backend response
        const list = Array.isArray(res?.data?.riskScores) ? res.data.riskScores : []

        // Convert risk scores into chart-friendly objects
        const mapped = list
          .map((r, idx) => {
            const num =
              typeof r?.riskScore === "number"
                ? r.riskScore
                : Number(String(r?.riskScore ?? "").trim())

            return {
              id: r?.id ?? idx,
              assessmentDate: r?.assessmentDate || r?.createdAt || "",
              riskScore: num,
              riskLevel: r?.riskLevel || "N/A",
              createdAt: r?.createdAt || "",
              _dateObj: parseDateValue(r?.assessmentDate || r?.createdAt || null),
            }
          })
          .filter((x) => Number.isFinite(x.riskScore))
          .sort((a, b) => {
            const dA = a._dateObj
            const dB = b._dateObj
            if (dA && dB) return dA.getTime() - dB.getTime()
            return String(a.assessmentDate).localeCompare(String(b.assessmentDate))
          })
          .map(({ _dateObj, ...rest }) => rest)

        setRiskHistory(mapped)
      } catch (err) {
        console.error(err)
        setRiskHistory([])
        setHistoryError("No historical risk scores found for this patient.")
      } finally {
        setHistoryLoading(false)
      }
    }

    loadHistory()
  }, [id])

  // -----------------------------
  // Values derived from state
  // -----------------------------

  // Build full name string
  const fullName = useMemo(() => {
    if (!details) return ""
    return `${details.firstName} ${details.lastName}`.trim()
  }, [details])

  // Choose chart line color based on most recent risk
  const trendLineColor = useMemo(() => {
    const last = riskHistory[riskHistory.length - 1]
    return riskColor(last?.riskLevel || latestRisk?.riskLevel)
  }, [riskHistory, latestRisk])

  // Calculate Y-axis bounds based on data
  const yDomain = useMemo(() => {
    if (!riskHistory || riskHistory.length === 0) return [0, 10]
    const vals = riskHistory.map((x) => x.riskScore)
    const max = Math.max(...vals)
    const top = Math.ceil((max + 0.5) * 2) / 2
    return [0, Math.max(1, top)]
  }, [riskHistory])

  // Block page access if not logged in
  if (!isAuthed) return <Navigate to="/login" replace />

  async function save() {
    setError("")
    try {
      await updatePatient(id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        age: editForm.age === "" ? null : Number(editForm.age),
        gender: editForm.gender,
        notes: editForm.notes,
      })

      setDetails((prev) => ({ ...prev, ...editForm }))
      setIsEditing(false)
      alert("Patient updated successfully.")
    } catch (err) {
      console.error(err)
      alert("Update failed. Backend may not be ready yet.")
    }
  }

  function cancel() {
    setIsEditing(false)
    if (!details) return
    setEditForm({
      firstName: details.firstName,
      lastName: details.lastName,
      age: details.age ?? "",
      gender: details.gender ?? "",
      notes: details.notes ?? "",
    })
  }

  async function remove() {
    const ok = window.confirm("Are you sure you want to delete this patient?")
    if (!ok) return

    try {
      await deletePatient(id)
      alert("Patient deleted successfully.")
      nav("/patients")
    } catch (err) {
      console.error(err)
      alert("Delete failed. Backend may not be ready yet.")
    }
  }

  if (loading) return <div className="text-sm text-slate-500">Loading...</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>
  if (!details) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold">Patient Profile</h1>

        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-700"
              >
                Edit
              </button>

              <button
                onClick={remove}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-500"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={save}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
              >
                Save
              </button>

              <button
                onClick={cancel}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Patient Details */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold mb-3">Patient Details</h2>

        {!isEditing ? (
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <span className="font-medium">Name:</span> {fullName}
              </p>
              <p>
                <span className="font-medium">Age:</span>{" "}
                {details.age === "" ? "N/A" : details.age}
              </p>
              <p>
                <span className="font-medium">Gender:</span>{" "}
                {details.gender || "N/A"}
              </p>
              <p>
                <span className="font-medium">Created:</span>{" "}
                {String(details.createdAt)}
              </p>
            </div>

            <div>
              <p className="font-medium mb-1">Doctor Notes:</p>
              <p className="text-slate-600">{details.notes || "No notes provided"}</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <input
              className="rounded-xl border border-slate-300 px-3 py-2"
              placeholder="First name"
              value={editForm.firstName}
              onChange={(e) =>
                setEditForm((s) => ({ ...s, firstName: e.target.value }))
              }
            />

            <input
              className="rounded-xl border border-slate-300 px-3 py-2"
              placeholder="Last name"
              value={editForm.lastName}
              onChange={(e) =>
                setEditForm((s) => ({ ...s, lastName: e.target.value }))
              }
            />

            <input
              className="rounded-xl border border-slate-300 px-3 py-2"
              placeholder="Age"
              value={editForm.age}
              onChange={(e) => setEditForm((s) => ({ ...s, age: e.target.value }))}
            />

            <input
              className="rounded-xl border border-slate-300 px-3 py-2"
              placeholder="Gender"
              value={editForm.gender}
              onChange={(e) =>
                setEditForm((s) => ({ ...s, gender: e.target.value }))
              }
            />

            <textarea
              className="md:col-span-2 rounded-xl border border-slate-300 px-3 py-2 min-h-[110px]"
              placeholder="Doctor notes"
              value={editForm.notes}
              onChange={(e) => setEditForm((s) => ({ ...s, notes: e.target.value }))}
            />
          </div>
        )}
      </div>

      {/* Latest Risk */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold mb-3">Risk Scores</h2>

        {riskLoading && (
          <div className="text-sm text-slate-500">Loading risk score...</div>
        )}

        {!riskLoading && riskError && (
          <div className="text-sm text-slate-500">{riskError}</div>
        )}

        {!riskLoading && !riskError && latestRisk && (
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Risk Level</p>
              <p className="text-xl font-semibold">{String(latestRisk.riskLevel)}</p>
            </div>

            <div>
              <p className="text-slate-500">Risk Score</p>
              <p className="text-xl font-semibold">{String(latestRisk.riskScore)}</p>
            </div>

            <div>
              <p className="text-slate-500">Assessment Date</p>
              <p>{String(latestRisk.assessmentDate)}</p>
            </div>

            <div>
              <p className="text-slate-500">Family History</p>
              <p>{String(latestRisk.familyHistory)}</p>
            </div>
          </div>
        )}

        {!riskLoading && !riskError && !latestRisk && (
          <div className="text-sm text-slate-500">No risk scores yet.</div>
        )}
      </div>

      {/* Risk Trend */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold mb-3">Risk Trend</h2>

        {historyLoading && (
          <div className="text-sm text-slate-500">Loading risk history...</div>
        )}

        {!historyLoading && historyError && (
          <div className="text-sm text-slate-500">{historyError}</div>
        )}

        {!historyLoading && !historyError && riskHistory.length === 0 && (
          <div className="text-sm text-slate-500">No historical risk scores available.</div>
        )}

        {!historyLoading && !historyError && riskHistory.length > 0 && (
          <div className="w-full">
            <ResponsiveContainer width="100%" height={256}>
              <LineChart
                data={riskHistory}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="assessmentDate"
                  tickFormatter={formatDateShort}
                  minTickGap={20}
                />
                <YAxis domain={yDomain} />
                <Tooltip
                  formatter={(val, name) => {
                    if (name === "riskScore") return [val, "Risk Score"]
                    return [val, name]
                  }}
                  labelFormatter={(label) => `Date: ${String(label)}`}
                  contentStyle={{ borderRadius: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="riskScore"
                  stroke={trendLineColor}
                  strokeWidth={3}
                  dot={(props) => {
                    const { cx, cy, payload } = props
                    if (cx == null || cy == null) return null
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill={riskColor(payload?.riskLevel)}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    )
                  }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
