"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface Student {
  id: string
  usn: string
  name: string
  email?: string
  phone?: string
  currentYear: number
  section?: string
  cgpa?: number
  backlogs: number
  status: string
  placementStatus: string
  updatedAt: string
  department: { id: string; name: string; code: string }
  batch: { id: string; name: string }
  _count: {
    achievements: number
    certifications: number
    internships: number
    placements: number
  }
}

interface Props {
  students: Student[]
  total: number
  page: number
  departments: Array<{ id: string; name: string; code: string }>
  batches: Array<{ id: string; name: string }>
  userRole: string
  userDeptId?: string
  filters: { q: string; dept: string; batch: string; year: string; status: string }
}

export function StudentsTable({
  students,
  total,
  page,
  departments,
  batches,
  userRole,
  userDeptId,
  filters,
}: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(filters.q)
  const [dept, setDept] = useState(filters.dept)
  const [batch, setBatch] = useState(filters.batch)
  const [year, setYear] = useState(filters.year)

  const applyFilters = (newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams()
    const merged = { q: search, dept, batch, year, ...newFilters }
    if (merged.q) params.set("q", merged.q)
    if (merged.dept) params.set("dept", merged.dept)
    if (merged.batch) params.set("batch", merged.batch)
    if (merged.year) params.set("year", merged.year)
    router.push(`/students?${params.toString()}`)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applyFilters({ q: search })
    }
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-6">
      {/* Header Area (Stitch screen1.html) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#000a1e] tracking-tight mb-1">
            Student Management
          </h1>
          <p className="text-sm text-[#44474e] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">groups</span>
            Total Students: {total}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/export"
            className="flex items-center gap-2 bg-white border border-[#c4c6cf] text-[#000a1e] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#eff4ff] transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export to Excel
          </Link>
          {["SUPER_ADMIN", "HOD", "FACULTY", "PLACEMENT_OFFICER"].includes(userRole) && (
            <Link
              href="/import"
              className="flex items-center gap-2 bg-[#eff4ff] border border-[#0058be]/30 text-[#0058be] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#d6e3ff] transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              Import Excel
            </Link>
          )}
          {["SUPER_ADMIN", "HOD", "FACULTY"].includes(userRole) && (
            <Link
              href="/students/new"
              className="flex items-center gap-2 bg-[#000a1e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#002147] transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Add New Student
            </Link>
          )}
        </div>
      </div>

      {/* Filter Bar (Stitch screen1.html) */}
      <div className="bg-white border border-[#c4c6cf] rounded-xl p-4 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative w-full lg:w-96 flex-shrink-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search USN or Name..."
            className="w-full pl-10 pr-4 py-2.5 border border-[#c4c6cf] rounded-lg bg-white focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all text-sm outline-none text-[#0d1c2e]"
          />
        </div>

        <div className="flex flex-wrap lg:flex-nowrap gap-3 w-full">
          <select
            value={dept}
            disabled={userRole === "HOD" && !!userDeptId}
            onChange={(e) => {
              setDept(e.target.value)
              applyFilters({ dept: e.target.value })
            }}
            className="flex-1 py-2.5 px-3 border border-[#c4c6cf] rounded-lg bg-white focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all text-sm text-[#44474e] outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>

          <select
            value={batch}
            onChange={(e) => {
              setBatch(e.target.value)
              applyFilters({ batch: e.target.value })
            }}
            className="flex-1 py-2.5 px-3 border border-[#c4c6cf] rounded-lg bg-white focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all text-sm text-[#44474e] outline-none"
          >
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                Batch {b.name}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value)
              applyFilters({ year: e.target.value })
            }}
            className="flex-1 py-2.5 px-3 border border-[#c4c6cf] rounded-lg bg-white focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all text-sm text-[#44474e] outline-none"
          >
            <option value="">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
      </div>

      {/* Data Table / Empty State (Stitch screen1.html) */}
      <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[400px]">
        {students.length === 0 ? (
          /* Elegant Empty State (Direct from Stitch screen1.html) */
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-[#f8f9ff] rounded-full flex items-center justify-center mb-4 border border-[#c4c6cf]">
              <span className="material-symbols-outlined text-[#74777f] text-3xl">sentiment_dissatisfied</span>
            </div>
            <h3 className="text-lg font-bold text-[#000a1e] mb-1">No student records available</h3>
            <p className="text-sm text-[#44474e] max-w-md">
              Student records will appear here once they are added to the system.
            </p>
            {["SUPER_ADMIN", "HOD", "FACULTY"].includes(userRole) && (
              <Link
                href="/students/new"
                className="mt-6 flex items-center gap-2 bg-white border border-[#c4c6cf] text-[#000a1e] px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#eff4ff] transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add First Student
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f8f9ff] border-b border-[#c4c6cf]">
                <tr>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    USN
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Student Name
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Department
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Batch
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Current Year
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    CGPA
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Placement Status
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Achievements
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Last Updated
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider text-right whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff4ff]">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#002147]">
                      {s.usn}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-sm text-[#000a1e]">
                      <Link href={`/students/${s.usn}`} className="hover:text-[#0058be] hover:underline">
                        {s.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#44474e]">
                      <span className="bg-[#eff4ff] text-[#004395] px-2 py-0.5 rounded font-medium">
                        {s.department.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#44474e]">{s.batch.name}</td>
                    <td className="py-3.5 px-4 text-xs text-[#44474e]">Year {s.currentYear}</td>
                    <td className="py-3.5 px-4 text-xs font-bold text-[#000a1e]">
                      {s.cgpa ? s.cgpa.toFixed(2) : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          s.placementStatus === "PLACED" ? "success"
                          : s.placementStatus === "ELIGIBLE" ? "default"
                          : "secondary"
                        }
                      >
                        {s.placementStatus.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#44474e]">
                      {s._count.achievements} items
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#74777f]">
                      {formatDate(s.updatedAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/students/${s.usn}`}
                        className="inline-flex items-center text-xs font-semibold text-[#0058be] hover:underline"
                      >
                        View 360°
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
