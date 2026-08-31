"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts"
import { formatCTC } from "@/lib/utils"

const COLORS = ["#2563eb", "#16a34a", "#9333ea", "#ea580c", "#0891b2", "#dc2626", "#ca8a04", "#0d9488"]

interface AnalyticsDashboardProps {
  stats: {
    totalStudents: number
    activeStudents: number
    placedStudents: number
    eligibleStudents: number
    placementRate: number
    avgCTC: number
    maxCTC: number
    medianCTC: number
    higherStudies: number
    internshipCount: number
    certificationCount: number
    placementDriveCount: number
    companyCount: number
  }
  deptPlacementData: Array<{ dept: string; name: string; total: number; placed: number; rate: number }>
  batchData: Array<{ batch: string; total: number; placed: number }>
  achData: Array<{ category: string; count: number }>
}

export function AnalyticsDashboard({ stats, deptPlacementData, batchData, achData }: AnalyticsDashboardProps) {
  const statCards = [
    { label: "Total Students", value: stats.totalStudents, color: "text-blue-700 bg-blue-50" },
    { label: "Placement Rate", value: `${stats.placementRate}%`, color: "text-green-700 bg-green-50" },
    { label: "Average CTC", value: stats.avgCTC > 0 ? formatCTC(stats.avgCTC) : "—", color: "text-purple-700 bg-purple-50" },
    { label: "Highest CTC", value: stats.maxCTC > 0 ? formatCTC(stats.maxCTC) : "—", color: "text-amber-700 bg-amber-50" },
    { label: "Median CTC", value: stats.medianCTC > 0 ? formatCTC(stats.medianCTC) : "—", color: "text-cyan-700 bg-cyan-50" },
    { label: "Companies", value: stats.companyCount, color: "text-slate-700 bg-slate-50" },
    { label: "Placement Drives", value: stats.placementDriveCount, color: "text-violet-700 bg-violet-50" },
    { label: "Internships", value: stats.internshipCount, color: "text-teal-700 bg-teal-50" },
    { label: "Certifications", value: stats.certificationCount, color: "text-rose-700 bg-rose-50" },
    { label: "Higher Studies", value: stats.higherStudies, color: "text-indigo-700 bg-indigo-50" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Institution-wide placement and achievement metrics</p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-xl font-bold rounded px-1 -ml-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dept placement rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Department-wise Placement Rate (%)</h2>
          {deptPlacementData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deptPlacementData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} domain={[0, 100]} unit="%" />
                <Tooltip
                  formatter={(v) => [`${v}%`, "Placement Rate"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                />
                <Bar dataKey="rate" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Batch comparison */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Batch-wise Students vs Placed</h2>
          {batchData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={batchData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="batch" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="total" name="Total" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="placed" name="Placed" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievement categories */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Achievement Categories</h2>
          {achData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={achData} dataKey="count" cx="50%" cy="50%" outerRadius={70} paddingAngle={2}>
                    {achData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {achData.map((item, i) => (
                  <div key={item.category} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-gray-600 truncate">{item.category}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dept table */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Department Placement Summary</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Department</th>
                <th className="text-right">Total</th>
                <th className="text-right">Placed</th>
                <th className="text-right">Rate</th>
              </tr>
            </thead>
            <tbody>
              {deptPlacementData.map((d) => (
                <tr key={d.dept}>
                  <td>
                    <span className="font-medium">{d.dept}</span>
                    <span className="text-xs text-gray-500 ml-2">{d.name}</span>
                  </td>
                  <td className="text-right text-sm">{d.total}</td>
                  <td className="text-right text-sm font-medium text-green-700">{d.placed}</td>
                  <td className="text-right">
                    <span className={`text-sm font-bold ${d.rate >= 70 ? "text-green-700" : d.rate >= 50 ? "text-amber-600" : "text-red-600"}`}>
                      {d.rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
