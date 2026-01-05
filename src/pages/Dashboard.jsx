import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { Link, Navigate } from "react-router-dom"
import { getPatientsByDoctor, getLatestRiskScore } from "../api/api"

export default function Dashboard() {
  // I keep the patient list in state so the page updates when the data comes back.
  const [patients, setPatients] = useState([])

  // I use these to show a loading message and any errors on screen.
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // I read the doctorId from localStorage because I save it when the doctor logs in.
  const doctorId = localStorage.getItem("doctorId")

  function normalizePatients(data) {
    // I added this because sometimes the backend gives me an array,
    // and other times it can come back as an object (like Firebase style).
    if (Array.isArray(data)) return data

    if (data && typeof data === "object") {
      // Here I turn the object into an array and keep the firebase key as "id".
      return Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }))
    }

    // If the data is weird or empty, I just return an empty list so the app doesn't crash.
    return []
  }

  // I made this small helper so risk text is always in the same format.
  // This way "High", "high risk", "HIGH-RISK" all end up as "high".
  const normalizeRisk = (v) =>
    String(v || "")
      .trim()
      .toLowerCase()
      .replace(" risk", "")
      .replaceAll("_", "")
      .replaceAll("-", "")

  useEffect(() => {
    async function load() {
      // If I don't have a doctorId, I stop here and let the redirect handle it.
      if (!doctorId) {
        setLoading(false)
        return
      }

      try {
        // First I load all patients for this doctor.
        const res = await getPatientsByDoctor(doctorId)
        const list = normalizePatients(res.data)

        // Then I get the latest risk score for each patient.
        // I use Promise.all so they all load together.
        const withScores = await Promise.all(
          list.map(async (p) => {
            const pid = p.id || p._id

            // If the patient has no id, I return a safe default so nothing breaks.
            if (!pid) {
              return {
                ...p,
                riskLevel: "N/A",
                riskLevelNorm: "na",
                riskScore: null,
                assessmentDate: null,
              }
            }

            try {
              const scoreRes = await getLatestRiskScore(pid)

              // My backend puts the real risk info inside scoreRes.data.data,
              // so I grab it from there (or use an empty object if it's missing).
              const latest = scoreRes?.data?.data || {}

              const riskLevelRaw = latest.riskLevel || "N/A"

              return {
                ...p,
                // I keep the original risk label for showing on screen if I need it.
                riskLevel: riskLevelRaw,

                // I also keep a cleaned version so filtering/counting is easier.
                riskLevelNorm: normalizeRisk(riskLevelRaw),

                // If the backend doesn't send a score/date, I store null.
                riskScore: latest.riskScore ?? null,
                assessmentDate: latest.assessmentDate || null,
              }
            } catch {
              // If the risk score call fails, I still return the patient with placeholders.
              return {
                ...p,
                riskLevel: "N/A",
                riskLevelNorm: "na",
                riskScore: null,
                assessmentDate: null,
              }
            }
          })
        )

        setPatients(withScores)
      } catch (err) {
        console.error(err)
        setError("Unable to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [doctorId])

  // If I don't have a doctorId, I send the user back to login.
  if (!doctorId) return <Navigate to="/login" replace />

  if (loading) return <div className="text-sm text-slate-500">Loading...</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>

  // I count each risk type so I can show totals and build the chart.
  const high = patients.filter((p) => p.riskLevelNorm === "high").length
  const med = patients.filter((p) => p.riskLevelNorm === "medium").length
  const low = patients.filter((p) => p.riskLevelNorm === "low").length

  // This is the format Recharts expects for the pie chart.
  const pieData = [
    { name: "High", value: high },
    { name: "Medium", value: med },
    { name: "Low", value: low },
  ]

  // These are the colours I use for the pie chart sections.
  const COLORS = ["#ef4444", "#f59e0b", "#10b981"]

  // Total patients is just the length of the list.
  const total = patients.length

  // I show the 3 most recent assessments.
  // I sort by assessmentDate first, and if that's missing I use createdAt.
  const recent = [...patients]
    .sort((a, b) => {
      const tA = a.assessmentDate || a.createdAt || ""
      const tB = b.assessmentDate || b.createdAt || ""
      return String(tB).localeCompare(String(tA))
    })
    .slice(0, 3)
    .map((p, i) => ({
      id: p.id || p._id || i,
      name: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
      date: String(p.assessmentDate || p.createdAt || "N/A"),
    }))

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>

      {/* I show a few quick numbers at the top so the doctor can see the overview fast. */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">Total Patients</p>
          <p className="text-3xl font-bold">{total}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">High Risk</p>
          <p className="text-3xl font-bold text-rose-600">{high}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">Recent Assessments</p>
          <p className="text-3xl font-bold text-indigo-600">{recent.length}</p>
        </div>
      </div>

      {/* Here I show the risk chart on the left and the most recent assessments on the right. */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold mb-3">Risk Distribution</h2>

          {/* 
            Recharts needs a real, measurable height to avoid width/height = -1.
            I set the height directly on ResponsiveContainer so it never depends on parent sizing.
          */}
          <div className="w-full">
            <ResponsiveContainer width="100%" height={256}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={90} label>
                  {pieData.map((entry, index) => (
                    // I use index here just to match each slice with the right colour.
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold mb-3">Recent Assessments</h2>
          <ul className="space-y-2">
            {recent.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between border border-slate-100 rounded-xl px-3 py-2"
              >
                <span>{p.name}</span>
                <span className="text-xs text-slate-500">{p.date}</span>
              </li>
            ))}

            {recent.length === 0 && (
              <div className="text-sm text-slate-500">No assessments yet</div>
            )}
          </ul>
        </div>
      </div>

      {/* These buttons are just quick shortcuts so the doctor can jump to other pages. */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold mb-3">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/patients"
            className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100"
          >
            Patients
          </Link>
          <Link
            to="/reports"
            className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100"
          >
            Reports
          </Link>
          <Link
            to="/news"
            className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100"
          >
            News
          </Link>
          <Link
            to="/settings"
            className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100"
          >
            Settings
          </Link>
          <Link
            to="/admin"
            className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100"
          >
            Sign out
          </Link>
        </div>
      </div>
    </div>
  )
}
