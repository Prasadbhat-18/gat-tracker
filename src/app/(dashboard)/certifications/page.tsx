import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { CertificationModal } from "@/components/certifications/CertificationModal"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Certifications" }

export default async function CertificationsPage() {
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

  const [certifications, students] = await Promise.all([
    prisma.certification.findMany({
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
            Student Certifications
          </h1>
          <p className="text-sm text-[#44474e] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">verified</span>
            Total Records: {certifications.length}
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
            <CertificationModal students={formattedStudents} />
          </div>
        )}
      </div>

      <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[380px]">
        {certifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-[#f8f9ff] rounded-full flex items-center justify-center mb-4 border border-[#c4c6cf]">
              <span className="material-symbols-outlined text-[#74777f] text-3xl">card_membership</span>
            </div>
            <h3 className="text-lg font-bold text-[#000a1e] mb-1">No certification records found</h3>
            <p className="text-sm text-[#44474e] max-w-md">
              Industry cloud credentials, NPTEL, Coursera, and professional certifications will appear here.
            </p>
            {canEdit && (
              <div className="mt-6">
                <CertificationModal
                  students={formattedStudents}
                  buttonText="Add First Certification"
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
                    Certification Name
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Issuing Organization
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Issue Date
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Expiry Date
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
                {certifications.map((c) => (
                  <tr key={c.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3.5 px-4 text-xs font-medium text-[#000a1e]">
                      <Link href={`/students/${c.student.usn}`} className="hover:text-[#0058be] hover:underline">
                        {c.student.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#002147]">
                      {c.student.usn}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="bg-[#eff4ff] text-[#004395] px-2 py-0.5 rounded font-medium">
                        {c.student.department.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-[#000a1e]">{c.name}</td>
                    <td className="py-3.5 px-4 text-xs text-[#44474e]">{c.issuingOrg}</td>
                    <td className="py-3.5 px-4 text-xs text-[#74777f]">{formatDate(c.issueDate)}</td>
                    <td className="py-3.5 px-4 text-xs text-[#74777f]">
                      {c.expiryDate ? formatDate(c.expiryDate) : "No Expiry"}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {c.certificateUrl ? (
                        <a
                          href={c.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0058be] hover:underline bg-[#eff4ff] border border-[#adc6ff] px-2.5 py-1 rounded-md transition"
                        >
                          <span className="material-symbols-outlined text-[14px]">description</span>
                          View Proof
                        </a>
                      ) : c.credentialUrl ? (
                        <a
                          href={c.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0058be] hover:underline bg-[#eff4ff] border border-[#adc6ff] px-2.5 py-1 rounded-md transition"
                        >
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          Verify
                        </a>
                      ) : (
                        <span className="text-[#74777f] text-[11px]">No doc</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <Badge
                        variant={
                          c.verificationStatus === "VERIFIED" ? "success"
                          : c.verificationStatus === "REJECTED" ? "destructive"
                          : "warning"
                        }
                      >
                        {c.verificationStatus}
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
