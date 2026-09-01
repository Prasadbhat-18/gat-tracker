import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { InternshipModal } from "@/components/internships/InternshipModal"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Internships" }

export default async function InternshipsPage() {
  const session = await auth()
  if (!session) return null

  const isAdmin = session.user.role === "SUPER_ADMIN"
  const where: Record<string, unknown> = {}
  if (!isAdmin && session.user.departmentId) {
    where.student = { departmentId: session.user.departmentId }
  }

  const studentWhere: Record<string, unknown> = { status: "ACTIVE" }
  if (!isAdmin && session.user.departmentId) {
    studentWhere.departmentId = session.user.departmentId
  }

  const [internships, students] = await Promise.all([
    prisma.internship.findMany({
      where,
      include: {
        student: { select: { name: true, usn: true, department: { select: { code: true } } } },
        addedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
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
  ])

  const formattedStudents = students.map((s) => ({
    id: s.id,
    usn: s.usn,
    name: s.name,
    departmentCode: s.department.code,
  }))

  const canEdit = ["SUPER_ADMIN", "HOD", "FACULTY", "PLACEMENT_OFFICER"].includes(session.user.role)

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#000a1e] tracking-tight mb-1">
            Student Internships
          </h1>
          <p className="text-sm text-[#44474e] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">work</span>
            Total Records: {internships.length}
          </p>
        </div>

        {canEdit && (
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/import"
              className="flex items-center gap-2 bg-[#eff4ff] border border-[#0058be]/30 text-[#0058be] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#d6e3ff] transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              Import Excel
            </Link>
            <InternshipModal students={formattedStudents} />
          </div>
        )}
      </div>

      <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[380px]">
        {internships.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-[#f8f9ff] rounded-full flex items-center justify-center mb-4 border border-[#c4c6cf]">
              <span className="material-symbols-outlined text-[#74777f] text-3xl">work_history</span>
            </div>
            <h3 className="text-lg font-bold text-[#000a1e] mb-1">No internship records found</h3>
            <p className="text-sm text-[#44474e] max-w-md">
              Industry internship records, monthly stipends, and certificate verifications will appear here.
            </p>
            {canEdit && (
              <div className="mt-6">
                <InternshipModal
                  students={formattedStudents}
                  buttonText="Add First Internship"
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
                    Company
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Role
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Duration
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Stipend
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Dates
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Certificate
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff4ff]">
                {internships.map((i) => (
                  <tr key={i.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3.5 px-4 text-xs font-medium text-[#000a1e]">
                      <Link href={`/students/${i.student.usn}`} className="hover:text-[#0058be] hover:underline">
                        {i.student.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#002147]">
                      {i.student.usn}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="bg-[#eff4ff] text-[#004395] px-2 py-0.5 rounded font-medium">
                        {i.student.department.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-[#000a1e]">{i.company}</td>
                    <td className="py-3.5 px-4 text-xs text-[#44474e]">{i.role}</td>
                    <td className="py-3.5 px-4 text-xs text-[#44474e]">{i.durationWeeks ? `${i.durationWeeks} weeks` : "—"}</td>
                    <td className="py-3.5 px-4 text-xs font-bold text-[#000a1e]">
                      {i.stipend ? `₹${i.stipend.toLocaleString()}/mo` : "Unpaid"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#74777f]">
                      {formatDate(i.startDate)} – {formatDate(i.endDate)}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {i.certificateUrl ? (
                        <a
                          href={i.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0058be] hover:underline bg-[#eff4ff] border border-[#adc6ff] px-2.5 py-1 rounded-md transition"
                        >
                          <span className="material-symbols-outlined text-[14px]">description</span>
                          View Proof
                        </a>
                      ) : (
                        <span className="text-[#74777f] text-[11px]">No doc</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <Badge
                        variant={
                          i.status === "COMPLETED" ? "success"
                          : i.status === "ONGOING" ? "default"
                          : "secondary"
                        }
                      >
                        {i.status}
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
