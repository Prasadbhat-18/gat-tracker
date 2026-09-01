"use client"

import { useState } from "react"
import { formatDate, formatCTC } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface StudentProfileProps {
  userRole?: string
  userId?: string
  student: {
    id: string
    usn: string
    name: string
    email?: string
    phone?: string
    dateOfBirth?: string
    gender?: string
    currentYear: number
    section?: string
    cgpa?: number
    backlogs: number
    status: string
    placementStatus: string
    department: { id: string; name: string; code: string }
    batch: { id: string; name: string }
    academicRecords: Array<{
      id: string
      semester: number
      sgpa: number
      backlogs: number
    }>
    achievements: Array<{
      id: string
      title: string
      category: string
      eventLevel?: string
      awardDate: string
      verificationStatus: string
    }>
    certifications: Array<{
      id: string
      name: string
      issuingOrg: string
      issueDate: string
      verificationStatus: string
    }>
    internships: Array<{
      id: string
      companyName: string
      role: string
      durationMonths: number
      stipendMonthly?: number
    }>
    projects: Array<{
      id: string
      title: string
      projectType: string
      technologies: string[]
      githubUrl?: string
    }>
    placements: Array<{
      id: string
      ctcLpa: number
      roleOffered: string
      offerDate: string
      company: { name: string }
    }>
    higherStudies: Array<{
      id: string
      institution: string
      program: string
      country?: string
    }>
  }
}

export function StudentProfile360({ student }: StudentProfileProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const latestPlacement = student.placements[0]

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-6">
      {/* Breadcrumbs & Actions (Stitch screen3.html) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#44474e]">
          <Link href="/students" className="hover:text-[#000a1e] transition-colors">
            Students
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-[#000a1e] font-semibold">{student.usn}</span>
        </nav>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/export"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#c4c6cf] rounded-lg text-xs font-semibold text-[#000a1e] hover:bg-[#eff4ff] transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            Export Record
          </Link>
        </div>
      </div>

      {/* Profile Header Card (Stitch screen3.html) */}
      <div className="bg-white border border-[#c4c6cf] rounded-xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-[#eff4ff] flex items-center justify-center border border-[#c4c6cf] shrink-0">
          <span className="material-symbols-outlined text-4xl text-[#000a1e]">person</span>
        </div>

        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left flex-grow">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h1 className="text-2xl font-bold text-[#000a1e]">{student.name}</h1>
            <Badge
              variant={
                student.placementStatus === "PLACED" ? "success"
                : student.placementStatus === "ELIGIBLE" ? "default"
                : "secondary"
              }
            >
              {student.placementStatus.replace(/_/g, " ")}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-xs text-[#44474e]">
            <div className="flex items-center gap-1">
              <span className="uppercase tracking-wider text-[#74777f]">USN:</span>
              <span className="font-mono font-bold text-[#000a1e]">{student.usn}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="uppercase tracking-wider text-[#74777f]">Dept:</span>
              <span className="font-semibold text-[#000a1e]">{student.department.name} ({student.department.code})</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="uppercase tracking-wider text-[#74777f]">Batch:</span>
              <span className="font-semibold text-[#000a1e]">{student.batch.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Stitch screen3.html) */}
      <div className="w-full border-b border-[#c4c6cf] overflow-x-auto">
        <nav className="flex items-center gap-6 min-w-max">
          {[
            { id: "overview", label: "Overview" },
            { id: "academic", label: "Academic Records" },
            { id: "achievements", label: "Achievements & Certifications" },
            { id: "internships", label: "Internships & Projects" },
            { id: "placement", label: "Placement Status" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 border-b-2 text-xs font-semibold px-1 transition-all ${
                activeTab === tab.id
                  ? "border-[#000a1e] text-[#000a1e]"
                  : "border-transparent text-[#44474e] hover:text-[#000a1e]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Bento Grid Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Personal & Academic Summary */}
          <div className="lg:col-span-8 space-y-6">
            {/* Personal Information Card */}
            <section className="bg-white border border-[#c4c6cf] rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#000a1e] mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be] text-xl">badge</span>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-xs">
                <div>
                  <span className="text-[#44474e] block mb-1">USN</span>
                  <span className="font-mono font-bold text-[#000a1e] text-sm">{student.usn}</span>
                </div>
                <div>
                  <span className="text-[#44474e] block mb-1">Full Name</span>
                  <span className="font-semibold text-[#000a1e] text-sm">{student.name}</span>
                </div>
                <div>
                  <span className="text-[#44474e] block mb-1">Gender</span>
                  <span className="text-[#000a1e] font-medium">{student.gender ?? "—"}</span>
                </div>
                <div>
                  <span className="text-[#44474e] block mb-1">Section / Division</span>
                  <span className="text-[#000a1e] font-medium">{student.section ?? "—"}</span>
                </div>
                <div>
                  <span className="text-[#44474e] block mb-1">Contact Number</span>
                  <span className="text-[#000a1e] font-medium">{student.phone ?? "—"}</span>
                </div>
                <div>
                  <span className="text-[#44474e] block mb-1">Email Address</span>
                  <span className="text-[#000a1e] font-medium">{student.email ?? "—"}</span>
                </div>
              </div>
            </section>

            {/* Academic Summary Card */}
            <section className="bg-white border border-[#c4c6cf] rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#000a1e] mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be] text-xl">school</span>
                Current Academic Summary
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#eff4ff] rounded-lg p-4 border border-[#d5e3fc] flex flex-col items-center text-center">
                  <span className="text-xs text-[#44474e] mb-1">Current Year</span>
                  <span className="text-lg font-bold text-[#000a1e]">Year {student.currentYear}</span>
                </div>
                <div className="bg-[#eff4ff] rounded-lg p-4 border border-[#d5e3fc] flex flex-col items-center text-center">
                  <span className="text-xs text-[#44474e] mb-1">CGPA</span>
                  <span className="text-lg font-bold text-[#000a1e]">
                    {student.cgpa ? student.cgpa.toFixed(2) : "—"}
                  </span>
                </div>
                <div className="bg-[#eff4ff] rounded-lg p-4 border border-[#d5e3fc] flex flex-col items-center text-center">
                  <span className="text-xs text-[#44474e] mb-1">Active Backlogs</span>
                  <span className="text-lg font-bold text-[#000a1e]">{student.backlogs}</span>
                </div>
                <div className="bg-[#eff4ff] rounded-lg p-4 border border-[#d5e3fc] flex flex-col items-center text-center">
                  <span className="text-xs text-[#44474e] mb-1">Semesters</span>
                  <span className="text-lg font-bold text-[#000a1e]">{student.academicRecords.length}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Placement & Recent Achievements */}
          <div className="lg:col-span-4 space-y-6">
            {/* Placement & Career Card */}
            <section className="bg-white border border-[#c4c6cf] rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#000a1e] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be] text-xl">work</span>
                Placement &amp; Career
              </h2>
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[#74777f] block mb-1">Status</span>
                  <Badge variant={student.placementStatus === "PLACED" ? "success" : "default"}>
                    {student.placementStatus.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="h-px bg-[#eff4ff]" />
                <div className="flex justify-between items-center">
                  <span className="text-[#74777f]">Company:</span>
                  <span className="font-semibold text-[#000a1e]">
                    {latestPlacement?.company.name ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#74777f]">Package (CTC):</span>
                  <span className="font-semibold text-[#000a1e]">
                    {latestPlacement ? formatCTC(latestPlacement.ctcLpa) : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#74777f]">Offer Date:</span>
                  <span className="font-semibold text-[#000a1e]">
                    {latestPlacement?.offerDate ? formatDate(latestPlacement.offerDate) : "—"}
                  </span>
                </div>
              </div>
            </section>

            {/* Achievements Summary */}
            <section className="bg-white border border-[#c4c6cf] rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#000a1e] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be] text-xl">workspace_premium</span>
                Recent Achievements
              </h2>
              {student.achievements.length === 0 ? (
                <div className="text-center p-6 bg-[#f8f9ff] rounded-lg border border-dashed border-[#c4c6cf]">
                  <span className="material-symbols-outlined text-3xl text-[#74777f] mb-2">emoji_events</span>
                  <h3 className="text-xs font-bold text-[#000a1e] mb-1">No achievements recorded</h3>
                  <p className="text-[11px] text-[#44474e]">
                    Certifications and awards will appear here once added by staff.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {student.achievements.slice(0, 3).map((a) => (
                    <div key={a.id} className="p-2.5 rounded-lg bg-[#f8f9ff] border border-[#d5e3fc] text-xs">
                      <p className="font-semibold text-[#000a1e]">{a.title}</p>
                      <p className="text-[11px] text-[#44474e] mt-0.5">{a.category} • {formatDate(a.awardDate)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* Academic Records Tab */}
      {activeTab === "academic" && (
        <div className="bg-white border border-[#c4c6cf] rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#000a1e] mb-4">Semester Academic History</h2>
          {student.academicRecords.length === 0 ? (
            <div className="text-center p-12 text-[#74777f] text-sm">No semester records uploaded yet.</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f8f9ff] border-b border-[#c4c6cf]">
                <tr>
                  <th className="py-2.5 px-3">Semester</th>
                  <th className="py-2.5 px-3">SGPA</th>
                  <th className="py-2.5 px-3">Backlogs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff4ff]">
                {student.academicRecords.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 px-3 font-semibold">Semester {r.semester}</td>
                    <td className="py-2.5 px-3 font-bold text-[#000a1e]">{r.sgpa.toFixed(2)}</td>
                    <td className="py-2.5 px-3">{r.backlogs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Achievements & Certifications Tab */}
      {activeTab === "achievements" && (
        <div className="bg-white border border-[#c4c6cf] rounded-xl p-6 shadow-sm space-y-8">
          {/* Achievements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#000a1e]">Co-Curricular &amp; Technical Achievements</h2>
                <p className="text-xs text-[#74777f]">Hackathons, papers, academic competitions, and awards</p>
              </div>
              <a
                href={`/achievements/new?usn=${student.usn}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#000a1e] hover:bg-[#002147] text-white text-xs font-semibold rounded-lg transition shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Record Achievement
              </a>
            </div>

            {student.achievements.length === 0 ? (
              <div className="p-8 text-center bg-[#f8f9ff] border border-dashed border-[#c4c6cf] rounded-xl text-xs text-[#74777f]">
                No achievement entries recorded for this student yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {student.achievements.map((a: any) => (
                  <div key={a.id} className="p-4 rounded-xl border border-[#c4c6cf] bg-[#f8f9ff] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-xs font-bold text-[#000a1e] leading-snug">{a.title}</h3>
                        <Badge variant={a.verificationStatus === "VERIFIED" ? "success" : "warning"}>
                          {a.verificationStatus}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[#44474e] mt-1">
                        {a.category} • {formatDate(a.achievementDate ?? a.awardDate)}
                        {a.level ? ` • ${a.level.replace(/_/g, " ")}` : ""}
                      </p>
                      {(a.organization ?? a.organizingBody) && (
                        <p className="text-[11px] text-[#74777f] mt-0.5">Org: {a.organization ?? a.organizingBody}</p>
                      )}
                      {(a.position ?? a.awardPosition) && (
                        <p className="text-[11px] font-semibold text-[#002147] mt-0.5">Award: {a.position ?? a.awardPosition}</p>
                      )}
                    </div>

                    {(a.documentUrl || a.certificateUrl) && (
                      <div className="mt-3 pt-2.5 border-t border-[#e2e8f0] flex justify-end">
                        <a
                          href={a.documentUrl || a.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0058be] hover:underline bg-white border border-[#adc6ff] px-2.5 py-1 rounded-md"
                        >
                          <span className="material-symbols-outlined text-[15px]">description</span>
                          View Certificate
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="pt-6 border-t border-[#eff4ff]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#000a1e]">Professional &amp; Cloud Certifications</h2>
                <p className="text-xs text-[#74777f]">Industry credentials, NPTEL, AWS, Azure, Google Cloud</p>
              </div>
              <a
                href={`/certifications/new?usn=${student.usn}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#c4c6cf] hover:bg-[#eff4ff] text-[#000a1e] text-xs font-semibold rounded-lg transition shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Record Certification
              </a>
            </div>

            {(!student.certifications || student.certifications.length === 0) ? (
              <div className="p-8 text-center bg-[#f8f9ff] border border-dashed border-[#c4c6cf] rounded-xl text-xs text-[#74777f]">
                No professional certifications recorded for this student yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {student.certifications.map((c: any) => (
                  <div key={c.id} className="p-4 rounded-xl border border-[#c4c6cf] bg-[#f8f9ff] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-xs font-bold text-[#000a1e] leading-snug">{c.name}</h3>
                        <Badge variant={c.verificationStatus === "VERIFIED" ? "success" : "default"}>
                          {c.verificationStatus}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[#44474e] mt-1">
                        {c.issuingOrganization} • Issued: {formatDate(c.issueDate)}
                      </p>
                      {c.credentialId && (
                        <p className="text-[10px] font-mono text-[#74777f] mt-0.5">ID: {c.credentialId}</p>
                      )}
                    </div>

                    {(c.certificateUrl || c.credentialUrl) && (
                      <div className="mt-3 pt-2.5 border-t border-[#e2e8f0] flex justify-end gap-2">
                        {c.credentialUrl && (
                          <a
                            href={c.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#44474e] hover:underline bg-white border border-[#c4c6cf] px-2.5 py-1 rounded-md"
                          >
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                            Verify
                          </a>
                        )}
                        {c.certificateUrl && (
                          <a
                            href={c.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0058be] hover:underline bg-white border border-[#adc6ff] px-2.5 py-1 rounded-md"
                          >
                            <span className="material-symbols-outlined text-[14px]">description</span>
                            View Certificate
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Internships & Projects Tab */}
      {activeTab === "internships" && (
        <div className="bg-white border border-[#c4c6cf] rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#000a1e] mb-3">Industry Internships</h2>
            {student.internships.length === 0 ? (
              <p className="text-xs text-[#74777f] py-2">No internship records found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {student.internships.map((i) => (
                  <div key={i.id} className="p-3.5 rounded-lg border border-[#c4c6cf] bg-[#f8f9ff]">
                    <h3 className="text-xs font-bold text-[#000a1e]">{i.companyName}</h3>
                    <p className="text-[11px] text-[#44474e] mt-0.5">{i.role} • {i.durationMonths} months</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Placement Tab */}
      {activeTab === "placement" && (
        <div className="bg-white border border-[#c4c6cf] rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#000a1e] mb-4">Placement Offers &amp; Outcomes</h2>
          {student.placements.length === 0 ? (
            <p className="text-xs text-[#74777f] py-4">No placement offers recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {student.placements.map((p) => (
                <div key={p.id} className="p-4 rounded-lg border border-[#c4c6cf] bg-[#f8f9ff] flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-[#000a1e]">{p.company.name}</h3>
                    <p className="text-xs text-[#44474e]">{p.roleOffered} • Offer Date: {formatDate(p.offerDate)}</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                    {formatCTC(p.ctcLpa)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
