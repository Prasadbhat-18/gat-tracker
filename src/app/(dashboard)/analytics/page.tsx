import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Analytics" }

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session) return null

  const isAdmin = session.user.role === "SUPER_ADMIN"
  const deptFilter = !isAdmin && session.user.departmentId ? { departmentId: session.user.departmentId } : {}

  const [
    totalStudents,
    activeStudents,
    placedStudents,
    higherStudiesStudents,
    placements,
    departments,
    batches,
    achievementsByCategory,
    internshipCount,
    certificationCount,
    placementDriveCount,
    companyCount,
  ] = await Promise.all([
    prisma.student.count({ where: deptFilter }),
    prisma.student.count({ where: { ...deptFilter, status: "ACTIVE" } }),
    prisma.student.count({ where: { ...deptFilter, placementStatus: "PLACED" } }),
    prisma.student.count({ where: { ...deptFilter, careerOutcome: "HIGHER_STUDIES" } }),
    prisma.placement.findMany({
      where: { isFinalAccepted: true, student: deptFilter },
      select: { ctc: true, student: { select: { departmentId: true, batchId: true } } },
    }),
    prisma.department.findMany({
      select: {
        id: true, name: true, code: true,
        students: { select: { placementStatus: true, status: true }, where: deptFilter },
      },
    }),
    prisma.academicBatch.findMany({
      select: {
        name: true, admissionYear: true,
        students: { select: { placementStatus: true }, where: deptFilter },
      },
      orderBy: { admissionYear: "asc" },
    }),
    prisma.achievement.groupBy({
      by: ["category"],
      _count: { id: true },
      where: { student: deptFilter },
    }),
    prisma.internship.count({ where: { student: deptFilter } }),
    prisma.certification.count({ where: { student: deptFilter } }),
    prisma.placementDrive.count(),
    prisma.company.count(),
  ])

  const ctcs = placements.filter(p => p.ctc).map(p => p.ctc!)
  const avgCTC = ctcs.length > 0 ? ctcs.reduce((a, b) => a + b, 0) / ctcs.length : 0
  const maxCTC = ctcs.length > 0 ? Math.max(...ctcs) : 0
  const medianCTC = ctcs.length > 0
    ? ctcs.sort((a, b) => a - b)[Math.floor(ctcs.length / 2)]
    : 0

  const eligibleStudents = await prisma.student.count({
    where: { ...deptFilter, placementStatus: { in: ["ELIGIBLE", "APPLIED", "SHORTLISTED", "PLACED"] } },
  })

  const deptPlacementData = departments.map((d) => ({
    dept: d.code,
    name: d.name,
    total: d.students.length,
    placed: d.students.filter((s) => s.placementStatus === "PLACED").length,
    rate: d.students.length > 0
      ? Math.round((d.students.filter(s => s.placementStatus === "PLACED").length / d.students.length) * 100)
      : 0,
  }))

  const batchData = batches.map((b) => ({
    batch: b.name,
    total: b.students.length,
    placed: b.students.filter(s => s.placementStatus === "PLACED").length,
  }))

  const achData = achievementsByCategory.map((a) => ({
    category: a.category.replace(/_/g, " "),
    count: a._count.id,
  }))

  return (
    <AnalyticsDashboard
      stats={{
        totalStudents,
        activeStudents,
        placedStudents,
        eligibleStudents,
        placementRate: eligibleStudents > 0 ? Math.round((placedStudents / eligibleStudents) * 100) : 0,
        avgCTC,
        maxCTC,
        medianCTC,
        higherStudies: higherStudiesStudents,
        internshipCount,
        certificationCount,
        placementDriveCount,
        companyCount,
      }}
      deptPlacementData={deptPlacementData}
      batchData={batchData}
      achData={achData}
    />
  )
}
