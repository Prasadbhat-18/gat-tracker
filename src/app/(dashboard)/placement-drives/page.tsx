import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Plus, Building2, MapPin, Calendar, Users } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Placement Drives" }

export default async function PlacementDrivesPage() {
  const session = await auth()
  if (!session) return null

  const isAdmin = session.user.role === "SUPER_ADMIN"
  const isPlacement = session.user.role === "PLACEMENT_OFFICER"

  const drives = await prisma.placementDrive.findMany({
    include: {
      company: { select: { name: true, industry: true } },
      _count: { select: { placements: true } },
    },
    orderBy: { driveDate: "desc" },
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Placement Drives</h1>
          <p className="text-sm text-gray-500 mt-0.5">{drives.length} drives organized</p>
        </div>
        {(isAdmin || isPlacement) && (
          <Link
            href="/placement-drives/new"
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
          >
            <Plus className="w-4 h-4" />
            New Drive
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Drive Name</th>
                <th>Academic Year</th>
                <th>Job Role</th>
                <th>CTC (LPA)</th>
                <th>Drive Date</th>
                <th>Eligible Depts</th>
                <th>Min CGPA</th>
                <th>Placed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {drives.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-gray-400 text-sm">
                    No placement drives created yet.
                  </td>
                </tr>
              ) : (
                drives.map((drive) => (
                  <tr key={drive.id}>
                    <td>
                      <div className="font-medium text-gray-900">{drive.company.name}</div>
                      {drive.company.industry && (
                        <div className="text-xs text-gray-500">{drive.company.industry}</div>
                      )}
                    </td>
                    <td className="font-medium text-gray-700">{drive.driveName}</td>
                    <td className="text-sm text-gray-600">{drive.academicYear}</td>
                    <td className="text-sm text-gray-700">{drive.jobRole}</td>
                    <td>
                      {drive.ctcOffered ? (
                        <span className="font-bold text-green-700">₹{drive.ctcOffered} LPA</span>
                      ) : "—"}
                    </td>
                    <td className="text-xs text-gray-500">{formatDate(drive.driveDate)}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {drive.eligibleDepts.map((d) => (
                          <span key={d} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">{d}</span>
                        ))}
                      </div>
                    </td>
                    <td className="text-sm text-gray-600">{drive.minCgpa ?? "—"}</td>
                    <td>
                      <span className="font-semibold text-green-700">{drive._count.placements}</span>
                    </td>
                    <td>
                      <Badge variant={drive.isActive ? "success" : "secondary"}>
                        {drive.isActive ? "Active" : "Closed"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
