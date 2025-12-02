import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import * as API from "../api/api" 

export default function Reports() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setReports([]);
    try {
      const res = await getReportsByPatient(firstName, lastName);
      const list = Array.isArray(res.data) ? res.data : [];
      setReports(list);
    } catch {
      setError("Unable to load reports for this patient");
    } finally {
      setLoading(false);
    }
  }

  function downloadTextReport(r) {
    const content = [
      "NMS-Web Patient Report",
      "",
      `Patient: ${r.patientName || `${firstName} ${lastName}`}`,
      `Report type: ${r.reportType || "N/A"}`,
      `Date: ${r.dateOfReport || r.createdAt || "N/A"}`,
      "",
      "Notes:",
      r.notes || "No notes recorded."
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nms-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Reports</h1>
      </div>

      <form onSubmit={search} className="grid md:grid-cols-3 gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
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
        <button className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 text-sm">
          Search reports
        </button>
      </form>

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
              const id = r.id || r._id || i;
              const patient = r.patientName || `${firstName} ${lastName}`;
              const date = r.dateOfReport || r.createdAt || "N/A";
              const type = r.reportType || "N/A";
              const notes = r.notes || "";

              return (
                <tr key={id} className="hover:bg-slate-800">
                  <td className="p-3 text-slate-100">{patient}</td>
                  <td className="p-3 text-slate-400">{String(date)}</td>
                  <td className="p-3 text-slate-200">{type}</td>
                  <td className="p-3 text-slate-300 max-w-xs truncate">
                    {notes}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => downloadTextReport(r)}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 hover:bg-slate-800 text-slate-100"
                    >
                      Download text
                    </button>
                  </td>
                </tr>
              );
            })}

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
  );
}
