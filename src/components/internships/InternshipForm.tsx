"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface StudentOption {
  id: string
  usn: string
  name: string
  departmentCode: string
}

interface InternshipFormProps {
  students: StudentOption[]
  preselectedUsn?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function InternshipForm({ students, preselectedUsn, onSuccess, onCancel }: InternshipFormProps) {
  const router = useRouter()
  const [usnInput, setUsnInput] = useState(preselectedUsn ?? "")
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [internshipType, setInternshipType] = useState("INDUSTRY")
  const [status, setStatus] = useState("COMPLETED")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [durationWeeks, setDurationWeeks] = useState("")
  const [stipend, setStipend] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [certificateUrl, setCertificateUrl] = useState("")
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const matchedStudent = students.find(
    (s) => s.usn.toUpperCase() === usnInput.trim().toUpperCase()
  )

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setErrorMsg("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      setCertificateUrl(data.url)
      setSelectedFile(file)
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload certificate")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    if (!usnInput.trim()) {
      setErrorMsg("Student USN is required")
      return
    }
    if (!company.trim()) {
      setErrorMsg("Company name is required")
      return
    }
    if (!role.trim()) {
      setErrorMsg("Role / domain is required")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/internships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usn: usnInput.trim().toUpperCase(),
          company: company.trim(),
          role: role.trim(),
          internshipType,
          status,
          startDate: startDate || null,
          endDate: endDate || null,
          durationWeeks: durationWeeks ? parseInt(durationWeeks) : null,
          stipend: stipend ? parseFloat(stipend) : null,
          location: location.trim() || null,
          description: description.trim() || null,
          certificateUrl: certificateUrl.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save internship")

      setSuccessMsg("Internship recorded successfully!")
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/internships")
          router.refresh()
        }
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
            Work Experience & Industry Training
          </span>
          <h1 className="text-xl font-bold mt-2 tracking-tight">Record Student Internship</h1>
          <p className="text-xs text-[#adc6ff] mt-0.5">
            Log corporate internships, research apprenticeships, stipends, and certificate proof
          </p>
        </div>
        <Link
          href="/internships"
          className="self-start md:self-auto text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition border border-white/20 flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to List
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

        {/* Student USN */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
            Student USN <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              list="student-list"
              value={usnInput}
              onChange={(e) => setUsnInput(e.target.value.toUpperCase())}
              placeholder="e.g. 1GA22CS001"
              required
              className="w-full font-mono text-sm font-bold bg-[#f8f9ff] border border-[#c4c6cf] focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] rounded-xl px-4 py-3 outline-none transition uppercase"
            />
            <datalist id="student-list">
              {students.map((s) => (
                <option key={s.id} value={s.usn}>
                  {s.name} ({s.departmentCode})
                </option>
              ))}
            </datalist>
          </div>
          {matchedStudent && (
            <p className="text-xs text-[#0058be] font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[15px]">person</span>
              {matchedStudent.name} • {matchedStudent.departmentCode} Department
            </p>
          )}
        </div>

        {/* Company & Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Company / Organization <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Infosys, Bosch, Cisco, DRDO"
              required
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Role / Domain <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Software Engineering Intern, ML Researcher"
              required
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>
        </div>

        {/* Type & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Internship Type
            </label>
            <select
              value={internshipType}
              onChange={(e) => setInternshipType(e.target.value)}
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            >
              <option value="INDUSTRY">Industry / Corporate</option>
              <option value="RESEARCH">Academic / Research Lab</option>
              <option value="REMOTE">Remote / Virtual</option>
              <option value="GOVT">Government / Public Sector</option>
              <option value="INTERNATIONAL">International</option>
              <option value="IN_HOUSE">In-House / College Center</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            >
              <option value="COMPLETED">Completed</option>
              <option value="ONGOING">Ongoing</option>
              <option value="OFFER_EXTENDED">PPO / Offer Extended</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>
        </div>

        {/* Dates & Duration & Stipend */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Duration (Weeks)
            </label>
            <input
              type="number"
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(e.target.value)}
              placeholder="e.g. 8"
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Monthly Stipend (₹)
            </label>
            <input
              type="number"
              value={stipend}
              onChange={(e) => setStipend(e.target.value)}
              placeholder="e.g. 25000"
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>
        </div>

        {/* Location & Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
            Location / City
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Bengaluru / Hybrid"
            className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
          />
        </div>

        {/* Certificate Upload */}
        <div className="space-y-2 border-t border-[#eff4ff] pt-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Completion Certificate / Proof Document
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition ${
                  uploadMode === "file" ? "bg-[#000a1e] text-white" : "bg-[#f8f9ff] text-[#44474e]"
                }`}
              >
                Upload File (PDF/Image)
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("url")}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition ${
                  uploadMode === "url" ? "bg-[#000a1e] text-white" : "bg-[#f8f9ff] text-[#44474e]"
                }`}
              >
                Drive / Web Link
              </button>
            </div>
          </div>

          {uploadMode === "file" ? (
            <div className="border-2 border-dashed border-[#c4c6cf] hover:border-[#0058be] rounded-xl p-5 text-center bg-[#f8f9ff] transition">
              <input
                type="file"
                id="internship-cert-file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFileUpload(f)
                }}
                className="hidden"
              />
              <label htmlFor="internship-cert-file" className="cursor-pointer block">
                <span className="material-symbols-outlined text-3xl text-[#0058be]">upload_file</span>
                <p className="text-xs font-semibold text-[#000a1e] mt-1">
                  {isUploading
                    ? "Uploading certificate..."
                    : selectedFile
                    ? `Uploaded: ${selectedFile.name}`
                    : "Click to upload Internship Completion Certificate (PDF, PNG, JPG up to 10MB)"}
                </p>
              </label>
            </div>
          ) : (
            <input
              type="url"
              value={certificateUrl}
              onChange={(e) => setCertificateUrl(e.target.value)}
              placeholder="https://drive.google.com/... or cloud document link"
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#eff4ff]">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-[#c4c6cf] text-xs font-semibold text-[#44474e] hover:bg-[#f8f9ff] transition"
            >
              Cancel
            </button>
          ) : (
            <Link
              href="/internships"
              className="px-5 py-2.5 rounded-xl border border-[#c4c6cf] text-xs font-semibold text-[#44474e] hover:bg-[#f8f9ff] transition"
            >
              Cancel
            </Link>
          )}
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="px-6 py-2.5 rounded-xl bg-[#000a1e] hover:bg-[#002147] text-white text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? "Saving..." : "Save Internship Record"}
          </button>
        </div>
      </form>
    </div>
  )
}
