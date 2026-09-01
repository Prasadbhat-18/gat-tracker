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

interface CompanyOption {
  id: string
  name: string
}

interface PlacementFormProps {
  students: StudentOption[]
  companies: CompanyOption[]
  preselectedUsn?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function PlacementForm({ students, companies, preselectedUsn, onSuccess, onCancel }: PlacementFormProps) {
  const router = useRouter()
  const [usnInput, setUsnInput] = useState(preselectedUsn ?? "")
  const [companyName, setCompanyName] = useState("")
  const [selectedCompanyId, setSelectedCompanyId] = useState("")
  const [jobRole, setJobRole] = useState("Software Engineer")
  const [ctc, setCtc] = useState("")
  const [location, setLocation] = useState("Bengaluru")
  const [offerDate, setOfferDate] = useState("")
  const [joiningDate, setJoiningDate] = useState("")
  const [offerStatus, setOfferStatus] = useState("ACCEPTED")
  const [isFinalAccepted, setIsFinalAccepted] = useState(true)
  const [offerLetterUrl, setOfferLetterUrl] = useState("")
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
      setOfferLetterUrl(data.url)
      setSelectedFile(file)
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload offer letter")
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
    const finalCompName = companyName.trim()
    if (!selectedCompanyId && !finalCompName) {
      setErrorMsg("Company selection or name is required")
      return
    }
    if (!jobRole.trim()) {
      setErrorMsg("Job role is required")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/placements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usn: usnInput.trim().toUpperCase(),
          companyId: selectedCompanyId || undefined,
          companyName: !selectedCompanyId ? finalCompName : undefined,
          jobRole: jobRole.trim(),
          ctc: ctc ? parseFloat(ctc) : null,
          location: location.trim() || null,
          offerDate: offerDate || null,
          joiningDate: joiningDate || null,
          offerStatus,
          isFinalAccepted,
          offerLetterUrl: offerLetterUrl.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to record placement")

      setSuccessMsg("Campus placement offer recorded successfully!")
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/placements")
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
            Training & Placement Cell
          </span>
          <h1 className="text-xl font-bold mt-2 tracking-tight">Record Student Placement Offer</h1>
          <p className="text-xs text-[#adc6ff] mt-0.5">
            Log company job offers, annual compensation (CTC), offer letters, and acceptance status
          </p>
        </div>
        <Link
          href="/placements"
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
            Placed Student USN <span className="text-red-500">*</span>
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
              Hiring Company <span className="text-red-500">*</span>
            </label>
            <div className="space-y-1">
              <select
                value={selectedCompanyId}
                onChange={(e) => {
                  setSelectedCompanyId(e.target.value)
                  if (e.target.value) setCompanyName("")
                }}
                className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
              >
                <option value="">-- Choose from Registered Companies or Type Below --</option>
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
                  placeholder="Or enter new company name (e.g. Cisco, Microsoft)"
                  className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2 outline-none focus:border-[#0058be]"
                />
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Job Designation / Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g. Associate Software Engineer, Cloud Analyst"
              required
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>
        </div>

        {/* CTC, Location, Offer Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Package CTC (₹ Lakhs / Annum) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={ctc}
              onChange={(e) => setCtc(e.target.value)}
              placeholder="e.g. 12.5"
              required
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Job Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bengaluru, Hyderabad"
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Offer Status
            </label>
            <select
              value={offerStatus}
              onChange={(e) => setOfferStatus(e.target.value)}
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            >
              <option value="ACCEPTED">Accepted</option>
              <option value="OFFERED">Offered / Under Review</option>
              <option value="JOINED">Joined Company</option>
              <option value="REJECTED">Declined / Rejected</option>
              <option value="REVOKED">Revoked</option>
            </select>
          </div>
        </div>

        {/* Dates & Final Acceptance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Offer Date
            </label>
            <input
              type="date"
              value={offerDate}
              onChange={(e) => setOfferDate(e.target.value)}
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Tentative Joining Date
            </label>
            <input
              type="date"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5 flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl">
              <input
                type="checkbox"
                checked={isFinalAccepted}
                onChange={(e) => setIsFinalAccepted(e.target.checked)}
                className="w-4 h-4 text-[#0058be] rounded"
              />
              <span className="text-xs font-semibold text-[#000a1e]">
                Primary / Final Accepted Offer
              </span>
            </label>
          </div>
        </div>

        {/* Offer Letter Upload */}
        <div className="space-y-2 border-t border-[#eff4ff] pt-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Offer Letter / Proof Document
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
                id="placement-offer-file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFileUpload(f)
                }}
                className="hidden"
              />
              <label htmlFor="placement-offer-file" className="cursor-pointer block">
                <span className="material-symbols-outlined text-3xl text-[#0058be]">upload_file</span>
                <p className="text-xs font-semibold text-[#000a1e] mt-1">
                  {isUploading
                    ? "Uploading offer document..."
                    : selectedFile
                    ? `Uploaded: ${selectedFile.name}`
                    : "Click to upload Offer Letter / Selection Email (PDF, PNG, JPG up to 10MB)"}
                </p>
              </label>
            </div>
          ) : (
            <input
              type="url"
              value={offerLetterUrl}
              onChange={(e) => setOfferLetterUrl(e.target.value)}
              placeholder="https://drive.google.com/... or offer letter document link"
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
              href="/placements"
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
            {isSubmitting ? "Saving..." : "Save Placement Offer"}
          </button>
        </div>
      </form>
    </div>
  )
}
