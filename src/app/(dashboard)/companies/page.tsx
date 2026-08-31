import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Companies" }

export default async function CompaniesPage() {
  const session = await auth()
  if (!session) return null

  const isAdmin = session.user.role === "SUPER_ADMIN"
  const isPlacement = session.user.role === "PLACEMENT_OFFICER"

  const companies = await prisma.company.findMany({
    include: {
      _count: { select: { placementDrives: true } },
      placementDrives: {
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  })

  // Count placed students per company
  const placementCounts = await prisma.placement.groupBy({
    by: ["companyId"],
    _count: { id: true },
    where: { isFinalAccepted: true },
  })
  const placedByCompany = Object.fromEntries(placementCounts.map((p) => [p.companyId, p._count.id]))

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#000a1e] tracking-tight mb-1">
            Partner Companies
          </h1>
          <p className="text-sm text-[#44474e] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">apartment</span>
            Total Records: {companies.length}
          </p>
        </div>

        {(isAdmin || isPlacement) && (
          <Link
            href="/companies/new"
            className="flex items-center gap-2 bg-[#000a1e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#002147] transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Company
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {companies.map((company) => (
          <div key={company.id} className="bg-white rounded-xl border border-[#c4c6cf] p-5 shadow-sm hover:shadow transition">
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-lg bg-[#eff4ff] flex items-center justify-center flex-shrink-0 border border-[#c4c6cf]">
                <span className="font-bold text-[#000a1e] text-sm">
                  {company.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <Badge variant={company.isActive ? "success" : "secondary"}>
                {company.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="mt-3">
              <h3 className="font-semibold text-[#000a1e]">{company.name}</h3>
              {company.industry && (
                <p className="text-xs text-[#44474e] mt-0.5">{company.industry}</p>
              )}
              {company.location && (
                <p className="text-xs text-[#74777f]">{company.location}</p>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-[#eff4ff] flex items-center justify-between text-xs text-[#44474e]">
              <span>{company._count.placementDrives} drives</span>
              <span className="font-semibold text-emerald-700">{placedByCompany[company.id] ?? 0} placed</span>
            </div>
          </div>
        ))}

        {companies.length === 0 && (
          <div className="col-span-full bg-white border border-[#c4c6cf] rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 bg-[#f8f9ff] rounded-full flex items-center justify-center mb-4 border border-[#c4c6cf]">
              <span className="material-symbols-outlined text-[#74777f] text-3xl">domain_disabled</span>
            </div>
            <h3 className="text-lg font-bold text-[#000a1e] mb-1">No companies registered yet</h3>
            <p className="text-sm text-[#44474e] max-w-md">
              Add recruiting companies, campus drive partners, and MoU organizations.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
