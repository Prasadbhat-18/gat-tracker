import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { StudentsTable } from "@/components/students/StudentsTable"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Student Management" }

interface Props {
  searchParams: Promise<{
    page?: string
    q?: string
    dept?: string
    batch?: string
    year?: string
    status?: string
  }>
}

export default async function StudentsPage({ searchParams }: Props) {
  const session = await auth()
  if (!session) return null

  const resolvedParams = await searchParams
  const page = parseInt(resolvedParams.page ?? "1")
  const q = resolvedParams.q ?? ""
  const dept = resolvedParams.dept ?? ""
  const batch = resolvedParams.batch ?? ""
  const year = resolvedParams.year ?? ""
  const status = resolvedParams.status ?? ""

  const isAdmin = session.user.role === "SUPER_ADMIN"
  const isFaculty = session.user.role === "FACULTY"

  const where: Record<string, unknown> = {}

  if (!isAdmin && session.user.departmentId) {
    where.departmentId = session.user.departmentId
  }
  if (dept && isAdmin) {
    where.departmentId = dept
  }
  if (batch) {
    where.batchId = batch
  }
  if (year) {
    where.currentYear = parseInt(year)
  }
  if (status) {
    where.placementStatus = status
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { usn: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ]
  }

  const [students, total, departments, batches] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        department: { select: { id: true, name: true, code: true } },
        batch: { select: { id: true, name: true } },
        _count: {
          select: {
            achievements: true,
            certifications: true,
            internships: true,
            placements: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * 20,
      take: 20,
    }),
    prisma.student.count({ where }),
    prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { code: "asc" },
    }),
    prisma.academicBatch.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { admissionYear: "desc" },
    }),
  ])

  return (
    <StudentsTable
      students={students as any}
      total={total}
      page={page}
      departments={departments}
      batches={batches}
      userRole={session.user.role}
      userDeptId={session.user.departmentId}
      filters={{ q, dept, batch, year, status }}
    />
  )
}
