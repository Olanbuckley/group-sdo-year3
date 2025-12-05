import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { Link, Navigate } from "react-router-dom"
import { getPatientsByDoctor, getLatestRiskScore } from "../api/api"

export default function Dashboard() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const doctorId = localStorage.getItem("doctorId")
  if (!doctorId) return <Navigate to="/login" replace />

  useEffect(() => {
    async function load() {
      try {
        console.log(doctorId)
        const res = await getPatientsByDoctor(doctorId)
        const list = Array.isArray(res.data) ? res.data : []

        // Fetch latest risk score for each patient
        const withScores = await Promise.all(
          list.map(async (p) => {
            const pid = p.id || p._id
            if (!pid) {
              return {
                ...p,
                riskLevel: "N/A",
                riskScore: null,
                assessmentDate: null
              }
            }

            try {
              const scoreRes = await getLatestRiskScore(pid)
              const latest = scoreRes.data || {}

              return {
                ...p,
                riskLevel: latest.riskLevel || "N/A",
                riskScore: latest.riskScore ?? null,
                assessmentDate: latest.assessmentDate || null
              }
            } catch {
              return {
                ...p,
                riskLevel: "N/A",
                riskScore: null,
                assessmentDate: null
              }
            }
          })
        )

        setPatients(withScores)
      } catch {
        setError("Unable to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [doctorId])

  if (loading) return <div className="text-sm text-slate-500">Loading...</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>

  // Count risk levels (Firebase uses lowercase: low, medium, high)
  const high = patients.filter(p => p.riskLevel === "high").length
  const med  = patients.filter(p => p.riskLevel === "medium").length
  const low  = patients.filter(p => p.riskLevel === "low").length

  const pieData = [
    { name: "High", value: high },
    { name: "Medium", value: med },
    { name: "Low", value: low }
  ]

  const COLORS = ["#ef4444", "#f59e0b", "#10b981"]
  const total = patients.length

  // Recent = based on assessmentDate → fallback to createdAt
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
      date: String(p.assessmentDate || p.createdAt || "N/A")
    }))

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>

      {/* Top Stats */}
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

      {/* Risk Distribution + Recent */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold mb-3">Risk Distribution</h2>
          <div className="w-full h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={90} label>
                  {pieData.map((entry, index) => (
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

      {/* Quick Links */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold mb-3">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/patients" className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100">Patients</Link>
          <Link to="/reports" className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100">Reports</Link>
          <Link to="/news" className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100">News</Link>
          <Link to="/settings" className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100">Settings</Link>
          <Link to="/admin" className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100">Admin</Link>
        </div>
      </div>
    </div>
  )
}
