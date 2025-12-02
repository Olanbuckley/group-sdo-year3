import { useEffect, useState } from "react"
import * as API from "../api/api"   // <-- FIXED

export default function News() {
  const [articles, setArticles] = useState([])
  const [topic, setTopic] = useState("all")
  const [date, setDate] = useState("any")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const res = await API.get("/news")
        const list = Array.isArray(res.data) ? res.data : []
        setArticles(list)
      } catch {
        setError("Unable to load news")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="text-sm text-slate-500">Loading...</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>

  const filtered = articles.filter((a) => {
    const itemTopic = a.topic || "general"
    const itemDate = a.date || "0000-00-00"

    const matchTopic = topic === "all" || itemTopic === topic
    const matchDate = date === "any" || itemDate >= date

    return matchTopic && matchDate
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-semibold">Medical News</h1>

        <div className="flex gap-2">
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 bg-white"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            <option value="all">All topics</option>
            <option value="research">Research</option>
            <option value="clinical">Clinical</option>
            <option value="policy">Policy</option>
          </select>

          <select
            className="rounded-xl border border-slate-300 px-3 py-2 bg-white"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          >
            <option value="any">Any time</option>
            <option value="2025-10-01">Since Oct 1 2025</option>
            <option value="2025-09-01">Since Sep 1 2025</option>
          </select>
        </div>
      </div>

      {/* Articles */}
      <div className="grid gap-4">
        {filtered.map((a, i) => {
          const id = a._id || a.id || i
          const title = a.title || "Untitled"
          const summary = a.summary || "No summary available."
          const published = a.date || "N/A"
          const link = a.link

          return (
            <article
              key={id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-lg">{title}</h2>
                <span className="text-xs text-slate-500">{published}</span>
              </div>

              <p className="text-slate-600 text-sm">{summary}</p>

              <div className="mt-3">
                {link ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm inline-block"
                  >
                    Read more
                  </a>
                ) : (
                  <span className="text-slate-400 text-sm">No link available</span>
                )}
              </div>
            </article>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-500 border border-slate-200 rounded-2xl bg-white shadow-sm">
            No articles found for this filter.
          </div>
        )}
      </div>
    </div>
  )
}
