"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface PlacementChartProps {
  batchStats: Array<{
    name: string
    admissionYear: number
    _count: { students: number }
    students: Array<{ placementStatus: string }>
  }>
  placementsByDept: Array<{
    name: string
    code: string
    _count: { students: number }
  }>
}

const COLORS = ["#000a1e", "#0058be", "#16a34a", "#9333ea", "#ea580c", "#0891b2"]

export function PlacementChart({ batchStats, placementsByDept }: PlacementChartProps) {
  const batchData = batchStats.map((batch) => {
    const placed = batch.students.filter((s) => s.placementStatus === "PLACED").length
    const total = batch._count.students
    return {
      batch: batch.name,
      total,
      placed,
      rate: total > 0 ? Math.round((placed / total) * 100) : 0,
    }
  })

  const deptData = placementsByDept.map((d) => ({
    name: d.code,
    value: d._count.students,
  }))

  return (
    <div className="bg-white rounded-xl border border-[#c4c6cf] p-6 shadow-sm">
      <h2 className="text-base font-bold text-[#000a1e] mb-4">Placement Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Batch-wise bar chart */}
        <div>
          <p className="text-xs text-[#44474e] mb-3 font-semibold uppercase tracking-wider">Batch-wise Placement Count</p>
          {batchData.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-[#74777f]">No batch data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={batchData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eff4ff" />
                <XAxis dataKey="batch" tick={{ fontSize: 11, fill: "#44474e" }} />
                <YAxis tick={{ fontSize: 11, fill: "#44474e" }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #c4c6cf", backgroundColor: "#ffffff" }}
                  formatter={(value, name) => [value, name === "placed" ? "Placed" : "Total"]}
                />
                <Bar dataKey="total" fill="#e6eeff" radius={[4, 4, 0, 0]} name="total" />
                <Bar dataKey="placed" fill="#0058be" radius={[4, 4, 0, 0]} name="placed" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Dept-wise pie */}
        <div>
          <p className="text-xs text-[#44474e] mb-3 font-semibold uppercase tracking-wider">Department-wise Placements</p>
          {deptData.filter(d => d.value > 0).length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-[#74777f]">No placement data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={deptData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${typeof percent === "number" ? (percent * 100).toFixed(0) : 0}%`}
                  labelLine={false}
                >
                  {deptData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #c4c6cf", backgroundColor: "#ffffff" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
