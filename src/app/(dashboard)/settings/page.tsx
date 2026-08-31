import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, Shield, Users } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Institutional Settings" }

export default async function SettingsPage() {
  const session = await auth()
  if (!session) return null

  const [departments, batches, users] = await Promise.all([
    prisma.department.findMany({
      include: { _count: { select: { students: true, users: true } } },
      orderBy: { code: "asc" },
    }),
    prisma.academicBatch.findMany({
      include: { _count: { select: { students: true } } },
      orderBy: { admissionYear: "asc" },
    }),
    prisma.user.findMany({
      include: { department: { select: { code: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ])

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Institutional Configuration</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Global Academy of Technology — System departments, active batches, and authorized administrative accounts.
        </p>
      </div>

      {/* Departments */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-semibold text-gray-900">Configured Engineering Departments</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {departments.map((dept) => (
            <div key={dept.id} className="p-3.5 rounded-lg border border-gray-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-mono">
                  {dept.code}
                </span>
                <Badge variant={dept.isActive ? "success" : "secondary"}>
                  {dept.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-900 mt-2">{dept.name}</p>
              <p className="text-xs text-gray-500 mt-1">{dept._count.students} students enrolled</p>
            </div>
          ))}
        </div>
      </div>

      {/* Batches */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h2 className="text-base font-semibold text-gray-900">Academic Batches</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {batches.map((batch) => (
            <div key={batch.id} className="p-3.5 rounded-lg border border-gray-100 bg-slate-50/50">
              <span className="text-sm font-bold text-gray-900 font-mono">Batch {batch.name}</span>
              <p className="text-xs text-gray-500 mt-1">
                {batch.admissionYear} – {batch.expectedGraduationYear}
              </p>
              <p className="text-xs text-purple-700 font-medium mt-2">{batch._count.students} enrolled students</p>
            </div>
          ))}
        </div>
      </div>

      {/* Authorized Staff */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-green-600" />
          <h2 className="text-base font-semibold text-gray-900">Authorized Administrative Accounts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Designation</th>
                <th>Role</th>
                <th>Department</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium text-gray-900">{u.name}</td>
                  <td className="text-xs text-gray-600">{u.designation ?? "—"}</td>
                  <td>
                    <Badge variant="default">{u.role.replace(/_/g, " ")}</Badge>
                  </td>
                  <td>
                    <span className="text-xs text-gray-700">{u.department?.code ?? "All Departments"}</span>
                  </td>
                  <td className="text-xs font-mono text-gray-600">{u.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
