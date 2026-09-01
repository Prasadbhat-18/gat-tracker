import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ProjectModal } from "@/components/projects/ProjectModal"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Projects" }

export default async function ProjectsPage() {
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

  const [projects, students] = await Promise.all([
    prisma.project.findMany({
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
            Student Projects
          </h1>
          <p className="text-sm text-[#44474e] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">folder</span>
            Total Records: {projects.length}
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
            <ProjectModal students={formattedStudents} />
          </div>
        )}
      </div>

      <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[380px]">
        {projects.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-[#f8f9ff] rounded-full flex items-center justify-center mb-4 border border-[#c4c6cf]">
              <span className="material-symbols-outlined text-[#74777f] text-3xl">folder_off</span>
            </div>
            <h3 className="text-lg font-bold text-[#000a1e] mb-1">No project records found</h3>
            <p className="text-sm text-[#44474e] max-w-md">
              Mini-projects, capstones, and faculty-guided research projects will appear here once added.
            </p>
            {canEdit && (
              <div className="mt-6">
                <ProjectModal
                  students={formattedStudents}
                  buttonText="Add First Project"
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
                    Project Title
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Type
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Technologies
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Faculty Guide
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Links & Docs
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff4ff]">
                {projects.map((p) => (
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
                    <td className="py-3.5 px-4 text-xs font-semibold text-[#000a1e] max-w-xs">
                      <span className="line-clamp-1">{p.title}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#44474e]">
                      {p.projectType.replace(/_/g, " ")}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {p.technologies.slice(0, 3).map((t) => (
                          <span key={t} className="text-[10px] bg-[#eff4ff] text-[#004395] px-1.5 py-0.5 rounded font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#44474e]">{p.facultyGuide ?? "—"}</td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        {p.githubUrl && (
                          <a
                            href={p.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0058be] hover:underline text-[11px] font-semibold flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-[13px]">code</span>
                            Code
                          </a>
                        )}
                        {p.documentUrl && (
                          <a
                            href={p.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0058be] hover:underline text-[11px] font-semibold flex items-center gap-0.5 bg-[#eff4ff] px-1.5 py-0.5 rounded border border-[#adc6ff]"
                          >
                            <span className="material-symbols-outlined text-[13px]">description</span>
                            Doc
                          </a>
                        )}
                        {!p.githubUrl && !p.documentUrl && (
                          <span className="text-[#74777f] text-[11px]">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <Badge
                        variant={
                          p.verificationStatus === "VERIFIED" ? "success"
                          : p.verificationStatus === "REJECTED" ? "destructive"
                          : "warning"
                        }
                      >
                        {p.verificationStatus}
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
