import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { PlacementChart } from "@/components/dashboard/PlacementChart"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Institutional Dashboard" }

async function getDashboardData(userRole: string, departmentId?: string) {
  const deptFilter = departmentId && userRole !== "SUPER_ADMIN"
    ? { departmentId }
    : {}

  const [
    totalStudents,
    activeStudents,
    graduatedStudents,
    placedStudents,
    totalAchievements,
    totalCertifications,
    totalInternships,
    totalProjects,
    higherStudies,
    companies,
    recentAuditLogs,
    placementsByDept,
    batchStats,
  ] = await Promise.all([
    prisma.student.count({ where: deptFilter }),
    prisma.student.count({ where: { ...deptFilter, status: "ACTIVE" } }),
    prisma.student.count({ where: { ...deptFilter, status: "GRADUATED" } }),
    prisma.student.count({ where: { ...deptFilter, placementStatus: "PLACED" } }),
    prisma.achievement.count({ where: { student: deptFilter } }),
    prisma.certification.count({ where: { student: deptFilter } }),
    prisma.internship.count({ where: { student: deptFilter } }),
    prisma.project.count({ where: { student: deptFilter } }),
    prisma.higherStudy.count({ where: { student: deptFilter } }),
    prisma.company.count(),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    prisma.department.findMany({
      select: {
        name: true,
        code: true,
        _count: {
          select: {
            students: { where: { placementStatus: "PLACED" } },
          },
        },
        students: {
          select: { id: true },
          where: deptFilter.departmentId ? { departmentId: deptFilter.departmentId } : {},
        },
      },
    }),
    prisma.academicBatch.findMany({
      select: {
        name: true,
        admissionYear: true,
        _count: {
          select: { students: true },
        },
        students: {
          select: { placementStatus: true },
        },
      },
      orderBy: { admissionYear: "desc" },
      take: 4,
    }),
  ])

  const eligibleStudents = await prisma.student.count({
    where: {
      ...deptFilter,
      placementStatus: { in: ["ELIGIBLE", "APPLIED", "SHORTLISTED", "SELECTED", "PLACED"] },
    },
  })

  return {
    totalStudents,
    activeStudents,
    graduatedStudents,
    placedStudents,
    eligibleStudents,
    unplacedStudents: Math.max(0, eligibleStudents - placedStudents),
    totalAchievements,
    totalCertifications,
    totalInternships,
    totalProjects,
    higherStudies,
    companies,
    placementRate: eligibleStudents > 0 ? Math.round((placedStudents / eligibleStudents) * 100) : 0,
    recentAuditLogs,
    placementsByDept,
    batchStats,
  }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const data = await getDashboardData(session.user.role, session.user.departmentId)

  return (
    <div className="space-y-8">
      {/* Stitch Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#000a1e] tracking-tight mb-1">
            Institutional Dashboard
          </h1>
          <p className="text-sm text-[#44474e] flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#0058be]">verified_user</span>
            Logged in as {session.user.name} ({session.user.role.replace(/_/g, " ")})
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
          {["SUPER_ADMIN", "HOD", "FACULTY"].includes(session.user.role) && (
            <Link
              href="/students/new"
              className="flex items-center gap-2 bg-[#000a1e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#002147] transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Register Student
            </Link>
          )}
        </div>
      </div>

      {/* KPI Stats Grid (Stitch Styled) */}
      <DashboardStats data={data} userRole={session.user.role} />

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <PlacementChart batchStats={data.batchStats} placementsByDept={data.placementsByDept} />
        </div>
        <div>
          <RecentActivity logs={data.recentAuditLogs} />
        </div>
      </div>
    </div>
  )
}
