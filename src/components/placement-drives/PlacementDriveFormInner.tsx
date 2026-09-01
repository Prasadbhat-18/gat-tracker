"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface CompanyOption {
  id: string
  name: string
}

export function PlacementDriveFormInner({ companies }: { companies: CompanyOption[] }) {
  const router = useRouter()
  const [selectedCompanyId, setSelectedCompanyId] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [driveName, setDriveName] = useState("")
  const [academicYear, setAcademicYear] = useState(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`)
  const [driveDate, setDriveDate] = useState("")
  const [jobRoles, setJobRoles] = useState("Software Engineer, Cloud Associate")
  const [minCgpa, setMinCgpa] = useState("6.5")
  const [maxBacklogs, setMaxBacklogs] = useState("0")
  const [ctcMin, setCtcMin] = useState("6.5")
  const [ctcMax, setCtcMax] = useState("14.0")
  const [status, setStatus] = useState("UPCOMING")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    if (!selectedCompanyId && !companyName.trim()) {
      setErrorMsg("Please select or enter a hiring company")
      return
    }
    if (!driveName.trim()) {
      setErrorMsg("Drive title / name is required")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/placement-drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompanyId || undefined,
          companyName: !selectedCompanyId ? companyName.trim() : undefined,
          driveName: driveName.trim(),
          academicYear: academicYear.trim(),
          driveDate: driveDate || null,
          jobRoles: jobRoles.split(/[,;|]/).map((r) => r.trim()).filter(Boolean),
          minCgpa: minCgpa ? parseFloat(minCgpa) : null,
          maxBacklogs: maxBacklogs ? parseInt(maxBacklogs) : 0,
          ctcMin: ctcMin ? parseFloat(ctcMin) : null,
          ctcMax: ctcMax ? parseFloat(ctcMax) : null,
          status,
          description: description.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to schedule placement drive")

      setSuccessMsg("Campus recruitment drive scheduled successfully!")
      setTimeout(() => {
        router.push("/placement-drives")
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white border border-[#c4c6cf] rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-[#000a1e] px-6 py-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#adc6ff] bg-[#002147] px-2.5 py-1 rounded-full border border-[#0058be]/40">
            Placement Cell Operations
          </span>
          <h1 className="text-xl font-bold mt-2 tracking-tight">Schedule Campus Placement Drive</h1>
          <p className="text-xs text-[#adc6ff] mt-0.5">
            Configure recruitment drives, eligibility cutoffs (CGPA & backlogs), packages, and job roles
          </p>
        </div>
        <Link
          href="/placement-drives"
          className="self-start md:self-auto text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition border border-white/20 flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Drives
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        {errorMsg && (
          <div className="p-4 bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#410002] rounded-xl text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ba1a1a] text-lg">error</span>
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-[#d1e7dd] border border-[#0f5132]/30 text-[#0f5132] rounded-xl text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0f5132] text-lg">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Company & Drive Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Recruiting Company <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => {
                setSelectedCompanyId(e.target.value)
                if (e.target.value) setCompanyName("")
              }}
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            >
              <option value="">-- Select Registered Partner or Enter Below --</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {!selectedCompanyId && (
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Or new company name (e.g. Cisco Systems)"
                className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2 outline-none focus:border-[#0058be] mt-1"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Drive Name / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={driveName}
              onChange={(e) => setDriveName(e.target.value)}
              placeholder="e.g. Cisco Campus Recruitment Drive 2025"
              required
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>
        </div>

        {/* Academic Year, Drive Date, Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Academic Year
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2024-25"
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Drive Date
            </label>
            <input
              type="date"
              value={driveDate}
              onChange={(e) => setDriveDate(e.target.value)}
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Drive Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            >
              <option value="UPCOMING">Upcoming</option>
              <option value="REGISTRATION_OPEN">Registration Open</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Roles & Eligibility */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Roles Offered (Comma separated)
            </label>
            <input
              type="text"
              value={jobRoles}
              onChange={(e) => setJobRoles(e.target.value)}
              placeholder="e.g. SDE-1, Cloud Engineer"
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Minimum CGPA Cutoff
            </label>
            <input
              type="number"
              step="0.1"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              placeholder="e.g. 6.5"
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Max Active Backlogs Allowed
            </label>
            <input
              type="number"
              value={maxBacklogs}
              onChange={(e) => setMaxBacklogs(e.target.value)}
              placeholder="0"
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>
        </div>

        {/* CTC Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Minimum CTC (₹ LPA)
            </label>
            <input
              type="number"
              step="0.1"
              value={ctcMin}
              onChange={(e) => setCtcMin(e.target.value)}
              placeholder="e.g. 6.5"
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Maximum CTC (₹ LPA)
            </label>
            <input
              type="number"
              step="0.1"
              value={ctcMax}
              onChange={(e) => setCtcMax(e.target.value)}
              placeholder="e.g. 14.0"
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
            Drive Instructions & Selection Process Details
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Aptitude test date, technical interview rounds, and dress code requirements..."
            className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be] resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#eff4ff]">
          <Link
            href="/placement-drives"
            className="px-5 py-2.5 rounded-xl border border-[#c4c6cf] text-xs font-semibold text-[#44474e] hover:bg-[#f8f9ff] transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#000a1e] hover:bg-[#002147] text-white text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? "Scheduling..." : "Schedule Recruitment Drive"}
          </button>
        </div>
      </form>
    </div>
  )
}
