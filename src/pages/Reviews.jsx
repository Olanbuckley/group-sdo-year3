import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { getAllReviews, deleteReview } from "../api/api.js"

export default function Reviews() {
  // I only allow admins to see this page, so I check the role first.
  const role = (localStorage.getItem("role") || "").trim().toLowerCase()
  if (role !== "admin") return <Navigate to="/login" replace />

  // This stores all the reviews from the backend.
  const [reviews, setReviews] = useState([])

  // I use these to show loading and error messages.
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  function normalize(data) {
    // I added this because the backend might return an array,
    // or it might return an object where the keys are ids.
    if (Array.isArray(data)) return data

    if (data && typeof data === "object") {
      // This turns the object into an array and keeps the key as the id.
      return Object.entries(data).map(([id, value]) => ({ id, ...value }))
    }

    return []
  }

  async function load() {
    // I reset the UI before loading new data.
    setError("")
    setLoading(true)

    try {
      // I load all reviews from the backend.
      const res = await getAllReviews()
      setReviews(normalize(res.data))
    } catch (err) {
      console.error(err)
      setError("Unable to load reviews.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // I load the reviews when the page first opens.
    load()
  }, [])

  async function remove(id) {
    // I ask for confirmation so the user doesn't delete a review by mistake.
    const ok = window.confirm("Delete this review?")
    if (!ok) return

    try {
      // I delete the review on the backend.
      await deleteReview(id)

      // I also remove it from the UI so the table updates straight away.
      setReviews((prev) => prev.filter((r) => (r.id || r._id) !== id))
    } catch (err) {
      console.error(err)
      alert("Delete failed — check Network tab for the request URL.")
    }
  }

  if (loading) return <div className="text-sm text-slate-500">Loading...</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Ratings & Reviews</h1>

        {/* This button lets the admin reload the list without refreshing the page */}
        <button
          onClick={load}
          className="rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-3 text-left">Rating</th>
              <th className="p-3 text-left">Review</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {reviews.map((r, idx) => {
              // I use a safe id for React keys in case some fields are missing.
              const id = r.id || r._id || idx

              // I add simple fallbacks so empty data does not break the table.
              const rating = r.rating ?? "N/A"
              const text = r.review || "(no review text)"

              return (
                <tr key={id} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-900 w-28">{rating}</td>

                  <td className="p-3 text-slate-900">
                    <div className="max-w-3xl">{text}</div>
                  </td>

                  <td className="p-3 w-28">
                    <button
                      // When I click this, I delete the review.
                      onClick={() => remove(id)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-xl hover:bg-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}

            {/* If there are no reviews, I show a simple message */}
            {reviews.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-6 text-slate-500">
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
