import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TopBar } from "@/components/layout/TopBar"
import { Toaster } from "@/components/ui/toaster"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0d1c2e] flex flex-col font-sans">
      {/* Stitch TopNavBar */}
      <TopBar
        userName={session.user.name ?? ""}
        userRole={session.user.role}
        userEmail={session.user.email ?? ""}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-8 py-8">
        {children}
      </main>

      {/* Stitch Institutional Footer */}
      <footer className="bg-[#eff4ff] border-t border-[#c4c6cf] mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 md:px-8 py-6 max-w-[1280px] mx-auto gap-4">
          <div className="text-xs text-[#44474e]">
            © {new Date().getFullYear()} Global Academy of Technology. Student Achievement &amp; Placement Tracking System.
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-[#44474e]">
            <a className="hover:text-[#000a1e] transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-[#000a1e] transition-colors" href="#">
              Terms of Service
            </a>
            <a className="hover:text-[#000a1e] transition-colors" href="#">
              Contact Support
            </a>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  )
}
