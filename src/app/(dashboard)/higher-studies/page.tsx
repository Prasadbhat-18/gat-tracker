import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Higher Studies" }

export default async function HigherStudiesPage() {
  const session = await auth()
  if (!session) return null

  const isAdmin = session.user.role === "SUPER_ADMIN"
  const where: Record<string, unknown> = {}
  if (!isAdmin && session.user.departmentId) {
    where.student = { departmentId: session.user.departmentId }
  }

  const higherStudies = await prisma.higherStudy.findMany({
    where,
    include: {
      student: { select: { name: true, usn: true, department: { select: { code: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const canEdit = ["SUPER_ADMIN", "HOD", "FACULTY"].includes(session.user.role)

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#000a1e] tracking-tight mb-1">
            Higher Studies
          </h1>
          <p className="text-sm text-[#44474e] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">account_balance</span>
            Total Records: {higherStudies.length}
          </p>
        </div>

        {canEdit && (
          <Link
            href="/higher-studies/new"
            className="flex items-center gap-2 bg-[#000a1e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#002147] transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Higher Study Record
          </Link>
        )}
      </div>

      <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[380px]">
        {higherStudies.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-[#f8f9ff] rounded-full flex items-center justify-center mb-4 border border-[#c4c6cf]">
              <span className="material-symbols-outlined text-[#74777f] text-3xl">school</span>
            </div>
            <h3 className="text-lg font-bold text-[#000a1e] mb-1">No higher study records found</h3>
            <p className="text-sm text-[#44474e] max-w-md">
              MS, M.Tech, MBA, and PhD admissions along with competitive exam scores (GATE, GRE, CAT) will appear here.
            </p>
            {canEdit && (
              <Link
                href="/higher-studies/new"
                className="mt-6 flex items-center gap-2 bg-white border border-[#c4c6cf] text-[#000a1e] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#eff4ff] transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add First Higher Study Record
              </Link>
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
                    Degree / Program
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    University / Institution
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Country
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Admission Year
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Exam Qualified
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff4ff]">
                {higherStudies.map((h) => (
                  <tr key={h.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3.5 px-4 text-xs font-medium text-[#000a1e]">
                      <Link href={`/students/${h.student.usn}`} className="hover:text-[#0058be] hover:underline">
                        {h.student.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#002147]">
                      {h.student.usn}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="bg-[#eff4ff] text-[#004395] px-2 py-0.5 rounded font-medium">
                        {h.student.department.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-[#000a1e]">{h.program}</td>
                    <td className="py-3.5 px-4 text-xs text-[#44474e]">{h.institution}</td>
                    <td className="py-3.5 px-4 text-xs text-[#44474e]">{h.country ?? "India"}</td>
                    <td className="py-3.5 px-4 text-xs text-[#74777f]">{h.admissionYear ?? "—"}</td>
                    <td className="py-3.5 px-4 text-xs font-medium text-[#000a1e]">
                      {h.examName ? `${h.examName}: ${h.examScore ?? "Qualified"}` : "—"}
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
