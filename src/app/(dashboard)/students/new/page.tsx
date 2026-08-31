import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { StudentForm } from "@/components/students/StudentForm"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Register New Student" }

export default async function NewStudentPage() {
  const session = await auth()
  if (!session) return null

  const [departments, batches] = await Promise.all([
    prisma.department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.academicBatch.findMany({ where: { isActive: true }, orderBy: { admissionYear: "desc" } }),
  ])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Register New Student</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Enter official student academic details. Student accounts will not be created (administrative tracking only).
        </p>
      </div>

      <StudentForm departments={departments} batches={batches} userRole={session.user.role} userDeptId={session.user.departmentId} />
    </div>
  )
}
