import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { loginAccount, getDoctorByEmail } from "../api/api.js"

export default function Login() {
  // I use navigate so I can send the user to other pages after login.
  const nav = useNavigate()

  // I store the email and password in state because they are typed into inputs.
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // I store error messages in state so I can show them on the screen.
  const [error, setError] = useState("")

  async function submit(e) {
    // I stop the normal form refresh because I want React to handle everything.
    e.preventDefault()
    setError("")

    try {
      // I clear any old login info first so a previous user doesn't affect this login.
      localStorage.removeItem("role")
      localStorage.removeItem("doctorId")

      // I send the email and password to the backend to log in.
      const res = await loginAccount({ email, password })

      // I use an empty object as backup so the code doesn't crash if res.data is missing.
      const account = res.data || {}

      console.log("Login response:", account)

      // I take the role from the backend response and clean it up.
      // I do this so "Admin" and "admin" are treated the same.
      const role = String(account.role || "").toLowerCase().trim()

      // If there is no role, I show an error because the app needs it to know where to go.
      if (!role) {
        setError("Login worked, but backend did not return a role.")
        return
      }

      // I store the role so other pages can check if the user is a doctor or admin.
      localStorage.setItem("role", role)

      // If the user is an admin, I send them straight to the admin page.
      if (role === "admin") {
        nav("/admin")
        return
      }

      // If the user is a doctor, I also need a doctorId so I can load their patients.
      if (role === "doctor") {
        // I try to take doctorId from the login response first (if the backend sends it).
        let doctorId = account.doctorId

        // If doctorId was not included, I look it up using the doctor email.
        if (!doctorId) {
          const docRes = await getDoctorByEmail(email)
          const doc = docRes.data || {}

          // I check a few possible keys because the backend might return the id differently.
          doctorId =
            doc.id || doc.doctorId || doc._id || doc.key || doc.firebaseId || null
        }

        // If I still can't find a doctorId, I show an error because the dashboard needs it.
        if (!doctorId) {
          setError("Doctor login worked, but no doctor profile was found for this email.")
          return
        }

        // I save doctorId so other pages can use it (like dashboard and patients).
        localStorage.setItem("doctorId", doctorId)

        // After a doctor logs in, I send them to the dashboard.
        nav("/dashboard")
        return
      }

      // If the role is something unexpected, I show an error so I notice the issue.
      setError("Unknown role returned from backend.")
    } catch (err) {
      console.error("Login error:", err)

      // I show a simple message so the user knows the login failed.
      setError("Incorrect email or password")
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 text-slate-900">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="text-xl font-semibold mb-1">Sign in</div>
        <p className="text-sm text-slate-500 mb-4">
          Doctors and healthcare professionals
        </p>

        {/* This form runs submit() when the user clicks the sign in button */}
        <form onSubmit={submit} className="grid gap-3">
          <input
            className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2"
            placeholder="Email"
            value={email}
            // I update state on each change so React always knows the current input value.
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* If there is an error, I show it under the inputs */}
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2"
          >
            Sign in
          </button>
        </form>

        {/* This link lets new users go to the register page */}
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
