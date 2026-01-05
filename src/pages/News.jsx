import { useEffect, useState } from "react"
import { useNavigate, Navigate } from "react-router-dom"

export default function News() {
  // I use navigate in case I need to send the user to another page.
  const nav = useNavigate()

  // I store the news articles in this state (the backend calls them patients, so I keep it as-is).
  const [patients, setPatients] = useState([])

  // This holds whatever the user types into the search box.
  const [query, setQuery] = useState("")

  // I use these to show loading and error messages on screen.
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  // I check who is logged in by reading doctorId from localStorage.
  const doctorId = localStorage.getItem("doctorId")

  useEffect(() => {
    // If there is no doctorId, I don't even try to load news.
    if (!doctorId) return

    async function load() {
      try {
        setLoading(true)

        // I fetch the doctor news from my Flask AI backend.
        const res = await fetch("https://flask-ai-firebase.onrender.com/doctornews")

        // If the server returns an error status, I throw an error myself.
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        // I turn the response into JSON.
        const data = await res.json()

        // The backend stores articles inside "listArtical", so I grab that.
        const rawList = data?.listArtical || []

        // I only keep it if it is an array, otherwise I use an empty list.
        const list = Array.isArray(rawList) ? rawList : []

        // I clean each article so the table always has the fields it expects.
        const cleaned = list.map((p, index) => ({
          id: index,
          siteTitle: p.siteTitle || "",
          pageTitle: p.pageTitle || "",
          siteUrl: p.siteUrl ?? "N/A",
        }))

        setPatients(cleaned)
      } catch (err) {
        console.error("Load Error:", err)
        setError("Unable to load news")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [doctorId])

  // If no one is logged in, I send them back to login.
  if (!doctorId) return <Navigate to="/login" replace />

  // I filter the news list based on what the user types in the search box.
  const filtered = patients.filter((p) => {
    const name = `${p.siteTitle}`.toLowerCase()
    return name.includes(query.toLowerCase())
  })

  if (loading) return <div className="text-sm text-slate-500">Loading...</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">News</h1>

        {/* This input lets the user search through the news list */}
        <input
          type="text"
          placeholder="Search news..."
          className="rounded-xl border border-slate-300 px-3 py-2 bg-white"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-3 text-left">Page Title</th>
              <th className="p-3 text-left">Site Title</th>
              <th className="p-3 text-left">Site URL</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-slate-50 cursor-pointer"
                // When I click a row, I open the article in a new tab.
                onClick={() => window.open(p.siteUrl, "_blank")}
              >
                <td className="p-3">{p.pageTitle}</td>
                <td className="p-3">{p.siteTitle}</td>
                <td className="p-3 text-blue-600">{p.siteUrl}</td>
              </tr>
            ))}

            {/* If nothing matches the search, I show a simple message */}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-6 text-slate-500">
                  No matching news found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
