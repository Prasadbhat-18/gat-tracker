import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { InternshipForm } from "@/components/internships/InternshipForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Record Student Internship",
}

interface Props {
  searchParams: Promise<{ usn?: string }>
}

export default async function NewInternshipPage({ searchParams }: Props) {
  const session = await auth()
  if (!session) redirect("/login")

  const canEdit = ["SUPER_ADMIN", "HOD", "FACULTY", "PLACEMENT_OFFICER"].includes(session.user.role)
  if (!canEdit) redirect("/internships")

  const resolvedParams = await searchParams
  const preselectedUsn = resolvedParams.usn

  const where: Record<string, unknown> = { status: "ACTIVE" }
  if (session.user.role !== "SUPER_ADMIN" && session.user.departmentId) {
    where.departmentId = session.user.departmentId
  }

  const students = await prisma.student.findMany({
    where,
    select: {
      id: true,
      usn: true,
      name: true,
      department: { select: { code: true } },
    },
    orderBy: { usn: "asc" },
    take: 300,
  })

  const formattedStudents = students.map((s) => ({
    id: s.id,
    usn: s.usn,
    name: s.name,
    departmentCode: s.department.code,
  }))

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      <InternshipForm
        students={formattedStudents}
        preselectedUsn={preselectedUsn}
      />
    </div>
  )
}
