import { useEffect, useState } from "react"
import { useNavigate, Navigate } from "react-router-dom" // <-- FIXED: Imports
import { getNews } from "../api/api" 

export default function Patients() {
  const nav = useNavigate()
  const [patients, setPatients] = useState([])
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const doctorId = localStorage.getItem("doctorId")

  // FIX: Redirect REMOVED from here. 
  // You cannot put a "return" before "useEffect". It crashes React.

useEffect(() => {
    if (!doctorId) return;

    async function load() {
      try {
        setLoading(true); // Ensure loading starts
        
        const res = await fetch('https://flask-ai-firebase.onrender.com/doctornews');

        // FIX 1: Check if the network request was actually successful
        if (!res.ok) {
           throw new Error(`HTTP error! status: ${res.status}`);
        }

        // FIX 2: Native fetch requires parsing the stream to JSON
        const data = await res.json(); 
        
        // FIX 3: Access listArtical from the parsed JSON, not res.data
        const rawList = data?.listArtical || []; 
        const list = Array.isArray(rawList) ? rawList : [];

        console.log("Fetched List:", list);

        const cleaned = list.map((p, index) => ({
          id: index, 
          siteTitle: p.siteTitle || "",
          pageTitle: p.pageTitle || "",
          siteUrl: p.siteUrl ?? "N/A",
        }));

        // Note: You are setting 'setPatients' but the data is articles. 
        // Ensure this is the intended state variable.
        setPatients(cleaned);

      } catch (err) {
        console.error("Load Error:", err);
        setError("Unable to load news");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [doctorId]); // Ensure dependencies are correct

  // FIX: Redirect MOVED here (must be after all hooks)
  if (!doctorId) return <Navigate to="/login" replace />

  const filtered = patients.filter((p) => {
    // FIX: Searching by siteTitle to match your display logic
    const name = `${p.siteTitle}`.toLowerCase()
    return name.includes(query.toLowerCase())
  })

  if (loading) return <div className="text-sm text-slate-500">Loading...</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Patients</h1>
        <input
          type="text"
          placeholder="Search name..."
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
              <th className="p-3 text-left">Site Url</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-slate-50 cursor-pointer"
                onClick={() => window.open(p.siteUrl, "_blank")} // FIX: Opens link in new tab
              >
                <td className="p-3">{p.pageTitle}</td>
                <td className="p-3">{p.siteTitle}</td>
                <td className="p-3 text-blue-600">{p.siteUrl}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-6 text-slate-500">
                  No matching patients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}