import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/LoginForm"

export const metadata: Metadata = {
  title: "GAT Student Achievement & Placement Tracking System",
  description: "Official institutional administrative platform for Global Academy of Technology (GAT), Bengaluru.",
}

export default function LoginPage() {
  return (
    <div className="antialiased text-[#0d1c2e] bg-[#f8f9ff] min-h-screen flex flex-col font-sans">
      {/* TopAppBar */}
      <header className="bg-white border-b border-[#c4c6cf] w-full sticky top-0 z-50 shadow-none">
        <div className="flex justify-between items-center w-full px-4 md:px-12 max-w-[1280px] mx-auto py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#eff4ff] flex items-center justify-center border border-[#c4c6cf]">
              <span className="material-symbols-outlined text-[#000a1e] text-xl">school</span>
            </div>
            <h1 className="text-xl font-bold text-[#000a1e] tracking-tight hidden md:block">
              Global Academy of Technology
            </h1>
            <h1 className="text-sm font-bold text-[#000a1e] md:hidden">GAT</h1>
          </div>
          <a
            href="#login-form"
            className="bg-[#000a1e] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#002147] transition-all cursor-pointer shadow-sm"
          >
            Staff Login
          </a>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-4 md:px-12 max-w-[1280px] mx-auto py-12 md:py-20 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-[#d6e3ff] text-[#001b3d] text-xs font-semibold px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Administrative Tracking System
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000a1e] leading-tight tracking-tight">
              Centralized Student Achievement &amp; Placement Tracking
            </h2>

            <p className="text-base sm:text-lg text-[#44474e] max-w-2xl mx-auto md:mx-0 leading-relaxed">
              A comprehensive institutional platform designed for HODs, Faculty, and Placement Officers to manage and analyze student academic journeys and placement outcomes.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-2">
              <a
                href="#login-form"
                className="w-full sm:w-auto text-center bg-[#000a1e] text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-[#002147] transition-all shadow-sm"
              >
                Staff Login
              </a>
              <a
                href="#feature-strip"
                className="w-full sm:w-auto text-center bg-white text-[#000a1e] border border-[#c4c6cf] px-8 py-3 rounded-lg text-sm font-semibold hover:bg-[#eff4ff] transition-colors shadow-sm"
              >
                Explore Features
              </a>
            </div>
          </div>

          {/* Dashboard Preview (Empty State) from Stitch */}
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#aec7f6]/20 to-[#d5e3fc]/40 rounded-xl transform rotate-2 scale-105 pointer-events-none" />
            <div className="bg-white border border-[#c4c6cf] rounded-xl p-6 shadow-sm relative z-10 w-full flex flex-col">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#c4c6cf]">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-[#000a1e]" />
                  <span className="text-xs font-bold text-[#000a1e] uppercase tracking-wider">System Overview</span>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 px-2.5 bg-[#eff4ff] text-[#0058be] text-[11px] font-semibold rounded flex items-center">
                    AY 2024–25
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#f8f9ff] border border-[#c4c6cf] rounded-lg p-4 flex flex-col justify-center items-center h-24">
                  <span className="text-[#44474e] text-xs font-semibold uppercase tracking-wider">Total Students</span>
                  <span className="text-2xl font-bold text-[#000a1e] mt-1">—</span>
                </div>
                <div className="bg-[#f8f9ff] border border-[#c4c6cf] rounded-lg p-4 flex flex-col justify-center items-center h-24">
                  <span className="text-[#44474e] text-xs font-semibold uppercase tracking-wider">Placements</span>
                  <span className="text-2xl font-bold text-[#000a1e] mt-1">—</span>
                </div>
              </div>

              <div className="border border-dashed border-[#c4c6cf] rounded-lg bg-[#f8f9ff] p-8 flex items-center justify-center">
                <div className="text-center flex flex-col items-center">
                  <span className="material-symbols-outlined text-[#74777f] text-4xl mb-2">dataset</span>
                  <p className="text-sm font-medium text-[#44474e]">System Initialized</p>
                  <p className="text-xs text-[#74777f] mt-0.5">Records will populate upon staff entry</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Strip */}
        <section id="feature-strip" className="bg-[#eff4ff] border-y border-[#c4c6cf] py-12">
          <div className="px-4 md:px-12 max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#d6e3ff] text-[#000a1e] flex items-center justify-center">
                <span className="material-symbols-outlined">folder_shared</span>
              </div>
              <h3 className="text-base font-semibold text-[#000a1e]">Centralized Records</h3>
              <p className="text-xs text-[#44474e]">Unified ledger from admission to graduation</p>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#d6e3ff] text-[#000a1e] flex items-center justify-center">
                <span className="material-symbols-outlined">military_tech</span>
              </div>
              <h3 className="text-base font-semibold text-[#000a1e]">Achievement Tracking</h3>
              <p className="text-xs text-[#44474e]">Competitions, publications, sports &amp; patents</p>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#d6e3ff] text-[#000a1e] flex items-center justify-center">
                <span className="material-symbols-outlined">work</span>
              </div>
              <h3 className="text-base font-semibold text-[#000a1e]">Placement Insights</h3>
              <p className="text-xs text-[#44474e]">Campus drives, CTC tracking &amp; verified offers</p>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#d6e3ff] text-[#000a1e] flex items-center justify-center">
                <span className="material-symbols-outlined">assessment</span>
              </div>
              <h3 className="text-base font-semibold text-[#000a1e]">Institutional Reports</h3>
              <p className="text-xs text-[#44474e]">Excel report exports for NAAC and NBA audits</p>
            </div>
          </div>
        </section>

        {/* Staff Login Card Section */}
        <section id="login-form" className="py-16 px-4 md:px-12 max-w-[1280px] mx-auto scroll-mt-20">
          <div className="max-w-md mx-auto bg-white border border-[#c4c6cf] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-6 pb-4 border-b border-[#eff4ff]">
              <div className="w-12 h-12 rounded-xl bg-[#eff4ff] text-[#000a1e] flex items-center justify-center mx-auto mb-3 border border-[#c4c6cf]">
                <span className="material-symbols-outlined text-2xl">lock</span>
              </div>
              <h2 className="text-xl font-bold text-[#000a1e]">Staff Portal Sign In</h2>
              <p className="text-xs text-[#44474e] mt-1">
                Authorized College Personnel Access Only
              </p>
            </div>

            <LoginForm />
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-[#000a1e] text-white py-20">
          <div className="px-4 md:px-12 max-w-[1280px] mx-auto text-center flex flex-col items-center gap-6">
            <h2 className="text-2xl sm:text-3xl font-bold">Secure Administrative Access</h2>
            <p className="text-sm sm:text-base text-[#aec7f6] max-w-2xl leading-relaxed">
              Access institutional data, manage student records, and generate compliance reports. Authorized personnel only.
            </p>
            <a
              href="#login-form"
              className="bg-white text-[#000a1e] px-8 py-3.5 rounded-lg text-sm font-bold hover:bg-[#eff4ff] transition-colors shadow-sm"
            >
              Staff Login
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#eff4ff] border-t border-[#c4c6cf]">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 md:px-12 py-8 max-w-[1280px] mx-auto gap-4">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-sm font-bold text-[#000a1e] mb-1">Global Academy of Technology</span>
            <p className="text-xs text-[#44474e] text-center md:text-left">
              © {new Date().getFullYear()} Global Academy of Technology. Student Achievement &amp; Placement Tracking System.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-[#44474e]">
            <a className="hover:text-[#000a1e] transition-colors" href="#">
              System Information
            </a>
            <a className="hover:text-[#000a1e] transition-colors" href="#">
              Privacy
            </a>
            <a className="hover:text-[#000a1e] transition-colors" href="#">
              Contact Administration
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
