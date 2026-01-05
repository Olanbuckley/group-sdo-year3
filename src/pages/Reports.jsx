import { useState } from "react"
import { Navigate } from "react-router-dom"
import { getReportsByPatient } from "../api/api.js"

export default function Reports() {
  // I protect this page so only logged in doctors can use it.
  const doctorId = localStorage.getItem("doctorId")
  if (!doctorId) return <Navigate to="/login" replace />

  // I store the name inputs in state because the user types them in.
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  // This holds the reports that come back from the backend.
  const [reports, setReports] = useState([])

  // I use these to show loading and error messages.
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function normalizeReports(data) {
    // I made this because sometimes the backend returns an array,
    // and other times it can return an object (like Firebase style).
    if (Array.isArray(data)) return data

    if (data && typeof data === "object") {
      // This turns the object into an array and keeps the key as the id.
      return Object.entries(data).map(([id, value]) => ({
        id,
        ...(value || {}),
      }))
    }

    // If the response is empty or not what I expect, I return an empty list.
    return []
  }

  async function search(e) {
    // I stop the form refreshing the page.
    e.preventDefault()

    // I reset the UI before doing a new search.
    setError("")
    setLoading(true)
    setReports([])

    // I trim spaces so " John " still works.
    const f = firstName.trim()
    const l = lastName.trim()

    // If the user didn't fill both names, I stop and show an error.
    if (!f || !l) {
      setLoading(false)
      setError("Please enter both first name and last name.")
      return
    }

    try {
      // I encode the names so spaces and special characters don't break the URL.
      const res = await getReportsByPatient(encodeURIComponent(f), encodeURIComponent(l))

      // I normalize the response so the table always gets an array.
      const list = normalizeReports(res.data)
      setReports(list)
    } catch (err) {
      console.error(err)
      setError("Unable to load reports for this patient")
    } finally {
      setLoading(false)
    }
  }

  function downloadTextReport(r) {
    // I use the name fields the user typed in as a fallback.
    const f = firstName.trim()
    const l = lastName.trim()

    // I build simple values for the report, and add defaults if something is missing.
    const patient = r.patientName || `${f} ${l}`.trim()
    const date = r.dateOfReport || r.createdAt || "N/A"
    const type = r.reportType || "N/A"
    const notes = r.notes || "No notes recorded."

    // This is the text content that will go inside the downloaded file.
    const content = [
      "NMS-Web Patient Report",
      "",
      `Patient: ${patient}`,
      `Report type: ${type}`,
      `Date: ${date}`,
      "",
      "Notes:",
      notes,
    ].join("\n")

    // I make a text file in the browser using a Blob.
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    // I make the filename safer by replacing spaces with underscores.
    const safePatient = String(patient).replaceAll(" ", "_")
    const safeType = String(type).replaceAll(" ", "_")
    const filename = `${safePatient}_${safeType}_report.txt`

    // I create a temporary link and click it to trigger the download.
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()

    // I clean up the blob URL after downloading.
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports</h1>
      </div>

      {/* This form lets the doctor search reports by patient first + last name */}
      <form
        onSubmit={search}
        className="grid md:grid-cols-3 gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4"
      >
        <input
          className="rounded-xl border border-slate-700 px-3 py-2 bg-slate-950 text-sm text-slate-100"
          placeholder="Patient first name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          className="rounded-xl border border-slate-700 px-3 py-2 bg-slate-950 text-sm text-slate-100"
          placeholder="Patient last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        {/* I disable the button when loading or when name fields are blank */}
        <button
          type="submit"
          disabled={loading || !firstName.trim() || !lastName.trim()}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 text-sm"
        >
          {loading ? "Searching..." : "Search reports"}
        </button>
      </form>

      {/* These messages show the user what is happening */}
      {loading && <div className="text-sm text-slate-400">Loading...</div>}
      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="text-left p-3">Patient</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Notes</th>
              <th className="text-left p-3">Download</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {reports.map((r, i) => {
              // I use a safe id for React keys.
              const id = r.id || r._id || i

              // I build these values to show in the table, with simple fallbacks.
              const patient = r.patientName || `${firstName.trim()} ${lastName.trim()}`.trim()
              const date = r.dateOfReport || r.createdAt || "N/A"
              const type = r.reportType || "N/A"
              const notes = r.notes || ""

              return (
                <tr key={id} className="hover:bg-slate-800">
                  <td className="p-3 text-slate-100">{patient}</td>
                  <td className="p-3 text-slate-400">{String(date)}</td>
                  <td className="p-3 text-slate-200">{type}</td>
                  <td className="p-3 text-slate-300 max-w-xs truncate">{notes}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      // When I click this, I download a text version of the report.
                      onClick={() => downloadTextReport(r)}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 hover:bg-slate-800 text-slate-100"
                    >
                      Download text
                    </button>
                  </td>
                </tr>
              )
            })}

            {/* If there are no reports and we're not loading, I show a message */}
            {reports.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-slate-400">
                  No reports to show.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
