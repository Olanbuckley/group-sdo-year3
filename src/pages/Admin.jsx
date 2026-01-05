import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { getAllDoctors, addDoctor, deleteDoctor, updateDoctor } from "../api/api.js"

export default function Admin() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: ""
  })

  // ✅ edit state
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: ""
  })

  // check admin login
  const role = localStorage.getItem("role")
  if (role !== "admin") {
    return <Navigate to="/login" replace />
  }

  function normalizeDoctors(data) {
    if (Array.isArray(data)) return data

    if (data && typeof data === "object") {
      return Object.entries(data).map(([key, value]) => ({
        id: key, // ✅ firebase key like "drSmith"
        ...value,
      }))
    }

    return []
  }

  // Load doctors list
  useEffect(() => {
    async function load() {
      try {
        const res = await getAllDoctors()
        setDoctors(normalizeDoctors(res.data))
      } catch (err) {
        console.error(err)
        setError("Unable to load doctors list")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function updateField(k, v) {
    setForm((s) => ({ ...s, [k]: v }))
  }

  // ✅ ADD DOCTOR (then re-fetch full list)
  async function createDoctor(e) {
    e.preventDefault()
    setError("")

    try {
      await addDoctor({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        address: form.address,
      })

      const refreshed = await getAllDoctors()
      setDoctors(normalizeDoctors(refreshed.data))

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: ""
      })

      alert("Doctor added successfully.")
    } catch (err) {
      console.error(err)
      alert("Failed to add doctor.")
    }
  }

  // ✅ DELETE DOCTOR
  async function removeDoctor(id) {
    const confirmed = window.confirm("Are you sure you want to delete this doctor?")
    if (!confirmed) return

    try {
      await deleteDoctor(id)
      setDoctors((prev) => prev.filter((d) => (d._id || d.id) !== id))
      alert("Doctor deleted successfully.")
    } catch (err) {
      console.error(err)
      alert("Delete failed. Backend may not be ready yet.")
    }
  }

  // ✅ Start edit
  function startEdit(d) {
    const id = d.id
    setEditingId(id)

    setEditForm({
      firstName: d.firstName || d.first_name || "",
      lastName: d.lastName || d.last_name || "",
      email: d.email || "",
      phone: d.phone || "",
      address: d.address || ""
    })
  }

  function cancelEdit() {
    setEditingId(null)
  }

  // ✅ Save edit
  async function saveEdit(id) {
    try {
      await updateDoctor(id, {
        first_name: editForm.firstName,
        last_name: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
      })

      // Update UI immediately
      setDoctors((prev) =>
        prev.map((d) => {
          const did = d._id || d.id
          if (did !== id) return d

          return {
            ...d,
            firstName: editForm.firstName,
            lastName: editForm.lastName,
            first_name: editForm.firstName,
            last_name: editForm.lastName,
            email: editForm.email,
            phone: editForm.phone,
            address: editForm.address,
          }
        })
      )

      setEditingId(null)
      alert("Doctor updated successfully.")
    } catch (err) {
      console.error(err)
      alert("Update failed. Backend may not be ready yet.")
    }
  }

  // ✅ EXPORT DATASET (NEW BACKEND: POST by email)
  function exportAll() {
    const defaultEmail = doctors?.[0]?.email || ""
    const email = window
      .prompt("Enter doctor email to export (e.g. laura.keane@nms.ie):", defaultEmail)
      ?.trim()

    if (!email) return

    fetch("https://nms-backend-kr6f.onrender.com/export/doctor/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Export failed: ${res.status}`)
        return res.blob()
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${email}_patients_export.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      })
      .catch((err) => {
        console.error(err)
        alert("Export failed — check backend route POST /export/doctor/patients")
      })
  }

  if (loading) return <div className="text-sm text-slate-500">Loading...</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Panel</h1>

        <button
          onClick={exportAll}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          Export Patient Dataset
        </button>
      </div>

      {/* Add Doctor Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="font-semibold mb-3">Add Doctor</h2>

        <form onSubmit={createDoctor} className="grid md:grid-cols-2 gap-3 text-sm">
          <input
            className="border border-slate-300 rounded-xl px-3 py-2"
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
          />

          <input
            className="border border-slate-300 rounded-xl px-3 py-2"
            placeholder="Last name"
            value={form.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
          />

          <input
            className="border border-slate-300 rounded-xl px-3 py-2"
            placeholder="Email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
          />

          <input
            className="border border-slate-300 rounded-xl px-3 py-2"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />

          <input
            className="md:col-span-2 border border-slate-300 rounded-xl px-3 py-2"
            placeholder="Address"
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
          />

          <button className="md:col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2">
            Add Doctor
          </button>
        </form>
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {doctors.map((d) => {
              const id = d.id
              const isEditing = editingId === id
              const name = `${d.firstName || d.first_name || ""} ${d.lastName || d.last_name || ""}`.trim()

              return (
                <tr key={id} className="hover:bg-slate-50">
                  <td className="p-3 !text-slate-900">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          className="border border-slate-300 rounded-lg px-2 py-1 w-28 text-slate-900 bg-white"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm((s) => ({ ...s, firstName: e.target.value }))}
                          placeholder="First"
                        />
                        <input
                          className="border border-slate-300 rounded-lg px-2 py-1 w-28 text-slate-900 bg-white"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm((s) => ({ ...s, lastName: e.target.value }))}
                          placeholder="Last"
                        />
                      </div>
                    ) : (
                      name || "(no name)"
                    )}
                  </td>

                  <td className="p-3 !text-slate-900">
                    {isEditing ? (
                      <input
                        className="border border-slate-300 rounded-lg px-2 py-1 w-full text-slate-900 bg-white"
                        value={editForm.email}
                        onChange={(e) => setEditForm((s) => ({ ...s, email: e.target.value }))}
                        placeholder="Email"
                      />
                    ) : (
                      d.email || "(no email)"
                    )}
                  </td>

                  <td className="p-3 !text-slate-900">
                    {isEditing ? (
                      <input
                        className="border border-slate-300 rounded-lg px-2 py-1 w-full text-slate-900 bg-white"
                        value={editForm.phone}
                        onChange={(e) => setEditForm((s) => ({ ...s, phone: e.target.value }))}
                        placeholder="Phone"
                      />
                    ) : (
                      d.phone || "(no phone)"
                    )}
                  </td>

                  <td className="p-3 flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveEdit(id)}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(d)}
                          className="px-3 py-1.5 bg-slate-900 text-white rounded-xl hover:bg-slate-700"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => removeDoctor(id)}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-xl hover:bg-red-500"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}

            {doctors.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-6 text-slate-500">
                  No doctors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
