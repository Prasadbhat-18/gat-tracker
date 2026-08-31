import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { StudentProfile360 } from "@/components/students/StudentProfile360"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ usn: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { usn } = await params
  const student = await prisma.student.findUnique({
    where: { usn },
    select: { name: true, usn: true },
  })
  return {
    title: student ? `${student.name} — ${student.usn}` : "Student Not Found",
  }
}

export default async function StudentProfilePage({ params }: Props) {
  const session = await auth()
  if (!session) return null

  const { usn } = await params

  const student = await prisma.student.findUnique({
    where: { usn },
    include: {
      department: true,
      batch: true,
      academicRecords: { orderBy: { semester: "asc" } },
      achievements: {
        include: { addedBy: { select: { name: true } }, verifiedBy: { select: { name: true } } },
        orderBy: { achievementDate: "desc" },
      },
      certifications: {
        include: { addedBy: { select: { name: true } } },
        orderBy: { issueDate: "desc" },
      },
      internships: {
        include: { addedBy: { select: { name: true } } },
        orderBy: { startDate: "desc" },
      },
      projects: {
        include: { addedBy: { select: { name: true } } },
        orderBy: { startDate: "desc" },
      },
      placements: {
        include: {
          company: { select: { name: true, industry: true } },
          drive: { select: { driveName: true } },
          addedBy: { select: { name: true } },
        },
        orderBy: { offerDate: "desc" },
      },
      higherStudies: { orderBy: { createdAt: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!student) notFound()

  // Role-based access check
  if (session.user.role === "HOD" && student.departmentId !== session.user.departmentId) {
    notFound()
  }

  return <StudentProfile360 student={student as any} userRole={session.user.role} userId={session.user.id} />
}
