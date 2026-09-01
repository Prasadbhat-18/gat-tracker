import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { AchievementModal } from "@/components/achievements/AchievementModal"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Achievements" }

export default async function AchievementsPage() {
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

  const [achievements, students] = await Promise.all([
    prisma.achievement.findMany({
      where,
      include: {
        student: {
          select: { name: true, usn: true, department: { select: { code: true } } },
        },
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

  const canEdit = ["SUPER_ADMIN", "HOD", "FACULTY"].includes(session.user.role)

  const categoryColors: Record<string, string> = {
    HACKATHON: "bg-orange-100 text-orange-700",
    ACADEMIC: "bg-blue-100 text-blue-700",
    CODING_COMPETITION: "bg-green-100 text-green-700",
    PUBLICATION: "bg-purple-100 text-purple-700",
    SPORTS: "bg-red-100 text-red-700",
    CULTURAL: "bg-pink-100 text-pink-700",
    RESEARCH: "bg-indigo-100 text-indigo-700",
    PATENT: "bg-amber-100 text-amber-700",
    DEFAULT: "bg-gray-100 text-gray-700",
  }

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto">
      {/* Stitch Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#000a1e] tracking-tight mb-1">
            Student Achievements
          </h1>
          <p className="text-sm text-[#44474e] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">military_tech</span>
            Total Records: {achievements.length}
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
            <AchievementModal students={formattedStudents} />
          </div>
        )}
      </div>

      {/* Data Table / Empty State (Stitch Styled) */}
      <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[380px]">
        {achievements.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-[#f8f9ff] rounded-full flex items-center justify-center mb-4 border border-[#c4c6cf]">
              <span className="material-symbols-outlined text-[#74777f] text-3xl">emoji_events</span>
            </div>
            <h3 className="text-lg font-bold text-[#000a1e] mb-1">No achievements recorded yet</h3>
            <p className="text-sm text-[#44474e] max-w-md">
              Student awards, hackathons, papers, and competition records will appear here once entered.
            </p>
            {canEdit && (
              <div className="mt-6">
                <AchievementModal
                  students={formattedStudents}
                  buttonText="Add First Achievement"
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
                    Achievement
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Category
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Level
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Organization
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Position
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Date
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Certificate
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Added By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff4ff]">
                {achievements.map((a) => (
                  <tr key={a.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3.5 px-4 text-xs font-medium text-[#000a1e]">
                      <Link href={`/students/${a.student.usn}`} className="hover:text-[#0058be] hover:underline">
                        {a.student.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#002147]">
                      {a.student.usn}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="bg-[#eff4ff] text-[#004395] px-2 py-0.5 rounded font-medium">
                        {a.student.department.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-[#000a1e] max-w-xs">
                      <span className="line-clamp-1">{a.title}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className={`px-2 py-0.5 rounded font-medium ${categoryColors[a.category] ?? categoryColors.DEFAULT}`}>
                        {a.category.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#44474e]">
                      {a.level?.replace(/_/g, " ") ?? "—"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#44474e] max-w-[140px]">
                      <span className="line-clamp-1">{a.organization ?? "—"}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-[#000a1e]">
                      {a.position ?? "—"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#74777f]">
                      {formatDate(a.achievementDate)}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {a.documentUrl ? (
                        <a
                          href={a.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0058be] hover:underline bg-[#eff4ff] border border-[#adc6ff] px-2 py-1 rounded-md transition"
                        >
                          <span className="material-symbols-outlined text-[14px]">description</span>
                          View Proof
                        </a>
                      ) : (
                        <span className="text-[#74777f] text-[11px]">No file</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <Badge
                        variant={
                          a.verificationStatus === "VERIFIED" ? "success"
                          : a.verificationStatus === "REJECTED" ? "destructive"
                          : "warning"
                        }
                      >
                        {a.verificationStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#74777f]">{a.addedBy.name}</td>
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
