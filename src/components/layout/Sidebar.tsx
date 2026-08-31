"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Trophy,
  Award,
  Briefcase,
  FolderKanban,
  Building2,
  CalendarDays,
  TrendingUp,
  GraduationCap,
  BarChart3,
  FileText,
  Upload,
  Download,
  ShieldCheck,
  ScrollText,
  Settings,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles: string[]
  badge?: string
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "HOD", "FACULTY", "PLACEMENT_OFFICER"] },
  { label: "Students", href: "/students", icon: Users, roles: ["SUPER_ADMIN", "HOD", "FACULTY", "PLACEMENT_OFFICER"] },
  { label: "Achievements", href: "/achievements", icon: Trophy, roles: ["SUPER_ADMIN", "HOD", "FACULTY"] },
  { label: "Certifications", href: "/certifications", icon: Award, roles: ["SUPER_ADMIN", "HOD", "FACULTY"] },
  { label: "Internships", href: "/internships", icon: Briefcase, roles: ["SUPER_ADMIN", "HOD", "FACULTY"] },
  { label: "Projects", href: "/projects", icon: FolderKanban, roles: ["SUPER_ADMIN", "HOD", "FACULTY"] },
  { label: "Companies", href: "/companies", icon: Building2, roles: ["SUPER_ADMIN", "PLACEMENT_OFFICER"] },
  { label: "Placement Drives", href: "/placement-drives", icon: CalendarDays, roles: ["SUPER_ADMIN", "PLACEMENT_OFFICER"] },
  { label: "Placements", href: "/placements", icon: TrendingUp, roles: ["SUPER_ADMIN", "HOD", "PLACEMENT_OFFICER"] },
  { label: "Higher Studies", href: "/higher-studies", icon: GraduationCap, roles: ["SUPER_ADMIN", "HOD", "PLACEMENT_OFFICER"] },
  { label: "Analytics", href: "/analytics", icon: BarChart3, roles: ["SUPER_ADMIN", "HOD", "PLACEMENT_OFFICER"] },
  { label: "Reports", href: "/reports", icon: FileText, roles: ["SUPER_ADMIN", "HOD", "PLACEMENT_OFFICER"] },
  { label: "Import Data", href: "/import", icon: Upload, roles: ["SUPER_ADMIN", "HOD", "FACULTY", "PLACEMENT_OFFICER"] },
  { label: "Export Data", href: "/export", icon: Download, roles: ["SUPER_ADMIN", "HOD", "PLACEMENT_OFFICER"] },
  { label: "Users & Roles", href: "/admin/users", icon: ShieldCheck, roles: ["SUPER_ADMIN"] },
  { label: "Audit Logs", href: "/audit-logs", icon: ScrollText, roles: ["SUPER_ADMIN"] },
  { label: "Settings", href: "/admin/settings", icon: Settings, roles: ["SUPER_ADMIN"] },
]

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  HOD: "HOD",
  FACULTY: "Faculty",
  PLACEMENT_OFFICER: "Placement Officer",
}

interface SidebarProps {
  userRole: string
  userName: string
  userEmail: string
}

export function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const visibleItems = navItems.filter((item) => item.roles.includes(userRole))

  return (
    <aside
      className={cn(
        "flex flex-col bg-[#0f2044] text-blue-100 transition-all duration-300 flex-shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-blue-900/50">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="bg-white p-1 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <img
                src="/gat-logo.png"
                alt="GAT"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-xs truncate leading-tight">GAT Tracker</p>
              <p className="text-blue-300 text-[10px] truncate">{roleLabels[userRole]}</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="bg-white p-1 rounded-lg flex items-center justify-center mx-auto shadow-sm">
            <img
              src="/gat-logo.png"
              alt="GAT"
              className="h-7 w-auto object-contain"
            />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-blue-400 hover:text-blue-200 transition p-1 rounded"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
        )}
      </div>

      {/* Collapse toggle when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="flex justify-center py-2 text-blue-400 hover:text-blue-200 hover:bg-blue-900/30 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors relative",
                isActive
                  ? "bg-blue-600/20 text-white border-r-2 border-blue-400"
                  : "text-blue-200/80 hover:bg-blue-900/40 hover:text-blue-100",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("flex-shrink-0", isActive ? "text-blue-400" : "text-blue-300/70", "w-4 h-4")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User info at bottom */}
      {!collapsed && (
        <div className="p-4 border-t border-blue-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">
                {userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{userName}</p>
              <p className="text-blue-300 text-xs truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
