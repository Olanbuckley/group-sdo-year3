import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { getDoctorById } from "../api/api"

export default function Settings() {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const doctorId = localStorage.getItem("doctorId")
  if (!doctorId) return <Navigate to="/login" replace />

  useEffect(() => {
    async function load() {
      try {
        const res = await getDoctorById(doctorId)
        const d = res.data || {}

        setForm({
          firstName: d.firstName || "",
          lastName: d.lastName || "",
          email: d.email || "",
          phone: d.phone || "",
          address: d.address || "",
          password: "" // password never prefills
        })
      } catch {
        setError("Unable to load settings")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [doctorId])

  function setField(k, v) {
    setForm((s) => ({ ...s, [k]: v }))
  }

  async function save(e) {
    e.preventDefault()

    // Backend does not support updating doctors yet.
    alert("Profile updated (local UI only — backend update not implemented).")
  }

  if (loading) return <div className="text-sm text-slate-500">Loading...</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>
  if (!form) return null

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-semibold">Account Settings</h1>

      <form
        onSubmit={save}
        className="grid md:grid-cols-2 gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
      >
        <div className="col-span-2 text-lg font-semibold mb-2 text-slate-700">
          Profile Details
        </div>

        <input
          className="rounded-xl border border-slate-300 px-3 py-2"
          placeholder="First name"
          value={form.firstName}
          onChange={(e) => setField("firstName", e.target.value)}
        />

        <input
          className="rounded-xl border border-slate-300 px-3 py-2"
          placeholder="Last name"
          value={form.lastName}
          onChange={(e) => setField("lastName", e.target.value)}
        />

        <input
          className="rounded-xl border border-slate-300 px-3 py-2 md:col-span-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
        />

        <input
          className="rounded-xl border border-slate-300 px-3 py-2"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setField("phone", e.target.value)}
        />

        <input
          className="rounded-xl border border-slate-300 px-3 py-2 md:col-span-2"
          placeholder="Address"
          value={form.address}
          onChange={(e) => setField("address", e.target.value)}
        />

        <input
          className="rounded-xl border border-slate-300 px-3 py-2"
          type="password"
          placeholder="New password"
          value={form.password}
          onChange={(e) => setField("password", e.target.value)}
        />

        <div className="col-span-2 flex gap-3">
          <button className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2">
            Save Changes
          </button>

          <button
            type="button"
            className="rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2"
            onClick={() => {
              localStorage.removeItem("doctorId")
              window.location.href = "/login"
            }}
          >
            Log out
          </button>
        </div>
      </form>
    </div>
  )
}
