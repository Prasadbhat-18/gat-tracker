"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  HOD: "HOD / Department Admin",
  FACULTY: "Faculty Coordinator",
  PLACEMENT_OFFICER: "Placement Officer",
}

interface TopBarProps {
  userName: string
  userRole: string
  userEmail: string
}

export function TopBar({ userName, userRole, userEmail }: TopBarProps) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)
  const [showMobileNav, setShowMobileNav] = useState(false)

  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Students", href: "/students" },
    { label: "Achievements", href: "/achievements" },
    { label: "Internships", href: "/internships" },
    { label: "Projects", href: "/projects" },
    { label: "Placements", href: "/placements" },
    { label: "Reports", href: "/export" },
    ...(userRole === "SUPER_ADMIN" ? [{ label: "Settings", href: "/settings" }] : []),
  ]

  return (
    <header className="bg-white border-b border-[#c4c6cf] w-full sticky top-0 z-40 shadow-none">
      <div className="flex justify-between items-center w-full px-4 md:px-8 max-w-[1280px] mx-auto h-16">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#eff4ff] flex items-center justify-center border border-[#c4c6cf]">
            <span className="material-symbols-outlined text-[#000a1e] text-lg">school</span>
          </div>
          <Link href="/dashboard" className="text-base font-bold text-[#000a1e] tracking-tight truncate hidden sm:block">
            Global Academy of Technology
          </Link>
          <Link href="/dashboard" className="text-sm font-bold text-[#000a1e] sm:hidden">
            GAT
          </Link>
        </div>

        {/* Center Nav Links (Direct from Stitch screen1.html) */}
        <nav className="hidden lg:flex gap-5 items-center">
          {navLinks.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-semibold transition-colors pb-1 ${
                  isActive
                    ? "text-[#0058be] border-b-2 border-[#0058be]"
                    : "text-[#44474e] hover:text-[#0058be]"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Section: Profile & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-[#eff4ff] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#002147] text-white flex items-center justify-center text-xs font-bold">
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="text-left hidden xl:block">
                <p className="text-xs font-semibold text-[#000a1e] leading-tight">{userName}</p>
                <p className="text-[10px] text-[#44474e]">{roleLabels[userRole]}</p>
              </div>
              <span className="material-symbols-outlined text-[#74777f] text-sm">expand_more</span>
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-[#c4c6cf] rounded-xl shadow-lg z-20 py-2">
                  <div className="px-4 py-2 border-b border-[#eff4ff]">
                    <p className="text-xs font-bold text-[#000a1e]">{userName}</p>
                    <p className="text-[11px] text-[#44474e] truncate mt-0.5">{userEmail}</p>
                    <span className="inline-block mt-1 text-[10px] bg-[#d6e3ff] text-[#001b3d] font-semibold px-2 py-0.5 rounded">
                      {roleLabels[userRole]}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="lg:hidden p-1.5 rounded-lg text-[#44474e] hover:bg-[#eff4ff] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              {showMobileNav ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {showMobileNav && (
        <div className="lg:hidden border-t border-[#eff4ff] bg-white px-4 py-3 space-y-1">
          {navLinks.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMobileNav(false)}
                className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                  isActive ? "bg-[#eff4ff] text-[#0058be]" : "text-[#44474e] hover:bg-[#f8f9ff]"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
