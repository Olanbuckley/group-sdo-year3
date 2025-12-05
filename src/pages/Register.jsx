import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createAccount, addDoctor } from "../api/api.js"

export default function Register() {
  const nav = useNavigate()
  const [error, setError] = useState("")
  const [f, setF] = useState({
    firstName: "",
    lastName: "",
    address: "",
    email: "",
    phone: "",
    password: "",
    confirm: ""
  })

  function set(k, v) {
    setF(s => ({ ...s, [k]: v }))
  }

  async function submit(e) {
    e.preventDefault()
    setError("")

    if (!f.firstName || !f.lastName || !f.email || !f.password) {
      setError("Please fill in all required fields")
      return
    }

    if (f.password !== f.confirm) {
      setError("Passwords do not match")
      return
    }

    try {
      // 1️⃣ Create account in /accounts
      const accRes = await createAccount({
        email: f.email,
        password: f.password,
        role: "doctor",
      })

      console.log("Account created:", accRes.data)

      // 2️⃣ Create doctor in /doctors — NO accountId, backend does NOT support it
      const docRes = await addDoctor({
        first_name: f.firstName,
        last_name: f.lastName,
        address: f.address,
        email: f.email,
        phone: f.phone,
      })

      console.log("Doctor created:", docRes.data)

      // 3️⃣ Redirect to login (recommended)
      nav("/login")

    } catch (err) {
      console.error("Registration error:", err)
      setError("Registration failed — backend rejected the request.")
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 text-slate-900">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="text-xl font-semibold mb-1">Create doctor account</div>
        <p className="text-sm text-slate-500 mb-4">
          For registered medical professionals
        </p>

        <form onSubmit={submit} className="grid md:grid-cols-2 gap-3">
          
          <input
            className="rounded-xl border border-slate-300 px-3 py-2"
            placeholder="First name"
            value={f.firstName}
            onChange={e => set("firstName", e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-3 py-2"
            placeholder="Surname"
            value={f.lastName}
            onChange={e => set("lastName", e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-3 py-2 md:col-span-2"
            placeholder="Work address"
            value={f.address}
            onChange={e => set("address", e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-3 py-2"
            placeholder="Email"
            value={f.email}
            onChange={e => set("email", e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-3 py-2"
            placeholder="Phone"
            value={f.phone}
            onChange={e => set("phone", e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-3 py-2"
            type="password"
            placeholder="Password"
            value={f.password}
            onChange={e => set("password", e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-3 py-2"
            type="password"
            placeholder="Confirm password"
            value={f.confirm}
            onChange={e => set("confirm", e.target.value)}
          />

          {error && (
            <div className="text-red-600 text-sm md:col-span-2">{error}</div>
          )}

          <button className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 md:col-span-2">
            Create account
          </button>
        </form>
      </div>
    </div>
  )
}
