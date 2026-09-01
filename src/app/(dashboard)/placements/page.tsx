import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDate, formatCTC } from "@/lib/utils"
import { PlacementModal } from "@/components/placements/PlacementModal"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Placements" }

export default async function PlacementsPage() {
  const session = await auth()
  if (!session) return null

  const isAdmin = session.user.role === "SUPER_ADMIN"
  const isPlacement = session.user.role === "PLACEMENT_OFFICER"
  const where: Record<string, unknown> = {}

  if (!isAdmin && !isPlacement && session.user.departmentId) {
    where.student = { departmentId: session.user.departmentId }
  }

  const studentWhere: Record<string, unknown> = { status: "ACTIVE" }
  if (!isAdmin && !isPlacement && session.user.departmentId) {
    studentWhere.departmentId = session.user.departmentId
  }

  const [placements, students, companies] = await Promise.all([
    prisma.placement.findMany({
      where,
      include: {
        student: {
          select: {
            name: true,
            usn: true,
            department: { select: { code: true } },
            batch: { select: { name: true } },
          },
        },
        company: { select: { name: true, industry: true } },
        drive: { select: { driveName: true } },
      },
      orderBy: { offerDate: "desc" },
      take: 200,
    }),
    prisma.student.findMany({
      where: studentWhere,
      select: {
        id: true,
        usn: true,
        name: true,
        department: { select: { code: true } },
      },
      orderBy: { usn: "asc" },
      take: 300,
    }),
    prisma.company.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  const formattedStudents = students.map((s) => ({
    id: s.id,
    usn: s.usn,
    name: s.name,
    departmentCode: s.department.code,
  }))

  // Stats
  const placed = placements.filter((p) => p.isFinalAccepted)
  const ctcs = placed.filter((p) => p.ctc).map((p) => p.ctc!)
  const avgCTC = ctcs.length > 0 ? ctcs.reduce((a, b) => a + b, 0) / ctcs.length : 0
  const maxCTC = ctcs.length > 0 ? Math.max(...ctcs) : 0

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto">
      {/* Stitch Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#000a1e] tracking-tight mb-1">
            Placements &amp; Career Offers
          </h1>
          <p className="text-sm text-[#44474e] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">work</span>
            Total Records: {placements.length}
          </p>
        </div>

        {(isAdmin || isPlacement) && (
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/import"
              className="flex items-center gap-2 bg-[#eff4ff] border border-[#0058be]/30 text-[#0058be] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#d6e3ff] transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              Import Excel
            </Link>
            <PlacementModal students={formattedStudents} companies={companies} />
          </div>
        )}
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Placements", value: placed.length },
          { label: "Total Offers", value: placements.length },
          { label: "Average CTC", value: avgCTC > 0 ? formatCTC(avgCTC) : "—" },
          { label: "Highest CTC", value: maxCTC > 0 ? formatCTC(maxCTC) : "—" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-[#c4c6cf] p-4 shadow-sm">
            <p className="text-xs text-[#44474e] font-semibold uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-bold text-[#000a1e] mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table / Empty state */}
      <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[380px]">
        {placements.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-[#f8f9ff] rounded-full flex items-center justify-center mb-4 border border-[#c4c6cf]">
              <span className="material-symbols-outlined text-[#74777f] text-3xl">work_outline</span>
            </div>
            <h3 className="text-lg font-bold text-[#000a1e] mb-1">No placement records yet</h3>
            <p className="text-sm text-[#44474e] max-w-md">
              Campus recruitment offers, verified salary packages, and appointment letters will appear here.
            </p>
            {(isAdmin || isPlacement) && (
              <div className="mt-6">
                <PlacementModal
                  students={formattedStudents}
                  companies={companies}
                  buttonText="Record First Placement"
                  buttonClassName="flex items-center gap-2 bg-white border border-[#c4c6cf] text-[#000a1e] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#eff4ff] transition-colors shadow-sm cursor-pointer"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f8f9ff] border-b border-[#c4c6cf]">
                <tr>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Student
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    USN
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Dept
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Batch
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Company
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Job Role
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    CTC (LPA)
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Location
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Offer Date
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Offer Letter
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff4ff]">
                {placements.map((p) => (
                  <tr key={p.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3.5 px-4 text-xs font-medium text-[#000a1e]">
                      <Link href={`/students/${p.student.usn}`} className="hover:text-[#0058be] hover:underline">
                        {p.student.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#002147]">
                      {p.student.usn}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="bg-[#eff4ff] text-[#004395] px-2 py-0.5 rounded font-medium">
                        {p.student.department.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#44474e]">{p.student.batch.name}</td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-[#000a1e]">{p.company.name}</td>
                    <td className="py-3.5 px-4 text-xs text-[#44474e]">{p.jobRole}</td>
                    <td className="py-3.5 px-4 text-xs font-bold text-emerald-700">
                      {p.ctc ? formatCTC(p.ctc) : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#44474e]">{p.location ?? "—"}</td>
                    <td className="py-3.5 px-4 text-xs text-[#74777f]">{formatDate(p.offerDate)}</td>
                    <td className="py-3.5 px-4 text-xs">
                      {p.offerLetterUrl ? (
                        <a
                          href={p.offerLetterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0058be] hover:underline bg-[#eff4ff] border border-[#adc6ff] px-2.5 py-1 rounded-md transition"
                        >
                          <span className="material-symbols-outlined text-[14px]">description</span>
                          View Letter
                        </a>
                      ) : (
                        <span className="text-[#74777f] text-[11px]">No doc</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <Badge
                        variant={
                          p.offerStatus === "ACCEPTED" || p.offerStatus === "JOINED" ? "success"
                          : p.offerStatus === "OFFERED" ? "default"
                          : "secondary"
                        }
                      >
                        {p.offerStatus.replace(/_/g, " ")}
                      </Badge>
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
