import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createAccount, addDoctor } from "../api/api.js"

export default function Register() {
  // I use navigate so I can send the user to the login page after registering.
  const nav = useNavigate()

  // I keep the error message in state so I can show it on the form.
  const [error, setError] = useState("")

  // I keep all form fields together in one object so it is easier to manage.
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
    // This little helper lets me update one field at a time without rewriting the whole object.
    setF(s => ({ ...s, [k]: v }))
  }

  async function submit(e) {
    // I stop the form from refreshing the page.
    e.preventDefault()
    setError("")

    // I do basic checks here so I don't send bad data to the backend.
    if (!f.firstName || !f.lastName || !f.email || !f.password) {
      setError("Please fill in all required fields")
      return
    }

    // I check passwords match so the user doesn't make an account with the wrong password.
    if (f.password !== f.confirm) {
      setError("Passwords do not match")
      return
    }

    try {
      // First I create the login account in /accounts.
      // I set the role to doctor because this register page is for doctors.
      const accRes = await createAccount({
        email: f.email,
        password: f.password,
        role: "doctor",
      })

      console.log("Account created:", accRes.data)

      // Then I create the doctor profile in /doctors.
      // I use first_name and last_name because that is what the backend expects.
      const docRes = await addDoctor({
        first_name: f.firstName,
        last_name: f.lastName,
        address: f.address,
        email: f.email,
        phone: f.phone,
      })

      console.log("Doctor created:", docRes.data)

      // After registering, I send the user to the login page so they can sign in.
      nav("/login")
    } catch (err) {
      console.error("Registration error:", err)

      // I show a simple message if the backend rejects the request.
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

        {/* This form runs submit() when the user clicks Create account */}
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

          {/* If there is an error, I show it under the inputs */}
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
