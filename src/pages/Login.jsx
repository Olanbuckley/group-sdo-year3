import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { loginAccount, getAllDoctors } from "../api/api.js"

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function submit(e) {
    e.preventDefault()
    setError("")

    try {
      // 1️⃣ LOGIN using /accounts/login
      const res = await loginAccount({ email, password })
      const account = res.data || {}

      console.log("Login response:", account)

      // Backend currently does NOT return role or doctorId.
      // So we must look up the doctor by email.

      // 2️⃣ Get doctors list
      const docRes = await getAllDoctors()
      const doctors = Array.isArray(docRes.data) ? docRes.data : []

      // 3️⃣ Find doctor profile by matching email
      const doctor = doctors.find(d => d.email?.toLowerCase() === email.toLowerCase())

      if (!doctor) {
        setError("Login successful, but no doctor profile exists for this email.")
        return
      }

      const doctorId = doctor.id || doctor._id
      if (!doctorId) {
        setError("Doctor profile found, but no ID returned from backend.")
        return
      }

      // 4️⃣ Save doctorId for all protected pages
      localStorage.setItem("doctorId", doctorId)

      // 5️⃣ Redirect to dashboard
      nav("/dashboard")

    } catch (err) {
      console.error("Login error:", err)
      setError("Incorrect email or password")
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 text-slate-900">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

        <div className="text-xl font-semibold mb-1">Sign in</div>
        <p className="text-sm text-slate-500 mb-4">Doctors and healthcare professionals</p>

        <form onSubmit={submit} className="grid gap-3">
          <input
            className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2">
            Sign in
          </button>
        </form>

        <div className="mt-3 text-sm">
          No account?{" "}
          <Link className="text-indigo-600" to="/register">
            Create one
          </Link>
        </div>

      </div>
    </div>
  )
}
