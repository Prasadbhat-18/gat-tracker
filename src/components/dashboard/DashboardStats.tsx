import Link from "next/link"

interface StatCardProps {
  label: string
  value: number | string
  iconName: string
  color: string
  href?: string
  suffix?: string
}

function StatCard({ label, value, iconName, color, href, suffix }: StatCardProps) {
  const card = (
    <div className="bg-white border border-[#c4c6cf] rounded-xl p-5 shadow-sm hover:border-[#0058be] hover:shadow transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-[#44474e] uppercase tracking-wider">{label}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-[#000a1e] tracking-tight">
              {value}
            </span>
            {suffix && <span className="text-sm font-semibold text-[#44474e]">{suffix}</span>}
          </div>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} text-white shadow-sm flex-shrink-0`}>
          <span className="material-symbols-outlined text-xl">{iconName}</span>
        </div>
      </div>
      {href && (
        <div className="mt-3 pt-2.5 border-t border-[#eff4ff] flex items-center justify-between text-[11px] text-[#0058be] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          <span>View records</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </div>
      )}
    </div>
  )

  if (href) return <Link href={href}>{card}</Link>
  return card
}

interface DashboardStatsProps {
  data: {
    totalStudents: number
    activeStudents: number
    graduatedStudents: number
    placedStudents: number
    unplacedStudents: number
    totalAchievements: number
    totalCertifications: number
    totalInternships: number
    totalProjects: number
    higherStudies: number
    companies: number
    placementRate: number
  }
  userRole: string
}

export function DashboardStats({ data, userRole }: DashboardStatsProps) {
  const isPlacement = userRole === "PLACEMENT_OFFICER"

  const stats: StatCardProps[] = [
    { label: "Total Students", value: data.totalStudents, iconName: "groups", color: "bg-[#002147]", href: "/students" },
    { label: "Active Cohort", value: data.activeStudents, iconName: "school", color: "bg-[#0058be]", href: "/students" },
    { label: "Placed Students", value: data.placedStudents, iconName: "trending_up", color: "bg-emerald-600", href: "/placements" },
    { label: "Placement Rate", value: data.placementRate, iconName: "donut_large", color: "bg-teal-600", suffix: "%" },
    { label: "Achievements", value: data.totalAchievements, iconName: "military_tech", color: "bg-amber-600", href: "/achievements" },
    { label: "Certifications", value: data.totalCertifications, iconName: "verified", color: "bg-purple-600", href: "/certifications" },
    { label: "Internships", value: data.totalInternships, iconName: "work", color: "bg-cyan-600", href: "/internships" },
    { label: "Projects", value: data.totalProjects, iconName: "folder", color: "bg-indigo-600", href: "/projects" },
    { label: "Higher Studies", value: data.higherStudies, iconName: "account_balance", color: "bg-slate-700", href: "/higher-studies" },
    { label: "Partner Companies", value: data.companies, iconName: "apartment", color: "bg-blue-800", href: "/companies" },
    { label: "Graduated", value: data.graduatedStudents, iconName: "history_edu", color: "bg-slate-600" },
    { label: "Awaiting Placement", value: data.unplacedStudents, iconName: "person_search", color: "bg-orange-600", href: "/students" },
  ]

  const visibleStats = isPlacement
    ? [stats[0], stats[2], stats[3], stats[9], stats[8], stats[10]]
    : stats

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {visibleStats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}
