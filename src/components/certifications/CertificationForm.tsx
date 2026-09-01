"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  FileCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
  Calendar,
  Building,
} from "lucide-react"
import Link from "next/link"

interface StudentOption {
  id: string
  usn: string
  name: string
  departmentCode: string
}

interface CertificationFormProps {
  students: StudentOption[]
  preselectedUsn?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function CertificationForm({ students, preselectedUsn, onSuccess, onCancel }: CertificationFormProps) {
  const router = useRouter()
  const [usn, setUsn] = useState(preselectedUsn ?? (students[0]?.usn ?? ""))
  const [name, setName] = useState("")
  const [issuingOrganization, setIssuingOrganization] = useState("AWS")
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0])
  const [expiryDate, setExpiryDate] = useState("")
  const [credentialId, setCredentialId] = useState("")
  const [credentialUrl, setCredentialUrl] = useState("")
  const [certificateUrl, setCertificateUrl] = useState("")
  const [certificateFileName, setCertificateFileName] = useState("")
  const [certificateFileSize, setCertificateFileSize] = useState("")
  const [description, setDescription] = useState("")

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError("")
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")

      setCertificateUrl(data.url)
      setCertificateFileName(file.name)
      setCertificateFileSize((file.size / (1024 * 1024)).toFixed(2) + " MB")
    } catch (err: any) {
      console.error(err)
      setUploadError(err.message || "Failed to process certificate file")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!usn) {
      setFormError("Student USN is required.")
      return
    }
    if (!name.trim()) {
      setFormError("Certification name is required.")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        usn: usn.trim().toUpperCase(),
        name: name.trim(),
        issuingOrganization: issuingOrganization.trim(),
        issueDate,
        expiryDate: expiryDate || undefined,
        credentialId: credentialId.trim() || undefined,
        credentialUrl: credentialUrl.trim() || undefined,
        certificateUrl: certificateUrl.trim() || undefined,
        description: description.trim() || undefined,
      }

      const res = await fetch("/api/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save certification")

      setFormSuccess(true)
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/certifications")
          router.refresh()
        }
      }, 1000)
    } catch (err: any) {
      console.error(err)
      setFormError(err.message || "Failed to save certification")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-[#c4c6cf] rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="border-b border-[#eff4ff] pb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#000a1e] flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#eff4ff] border border-[#c4c6cf] flex items-center justify-center text-[#0058be]">
              <FileCheck className="w-5 h-5" />
            </span>
            Record Student Certification
          </h2>
          <p className="text-xs text-[#44474e] mt-1">
            Log professional, cloud (AWS, Azure, GCP), NPTEL, or industry certifications.
          </p>
        </div>

        <Link
          href="/certifications"
          className="text-xs font-semibold text-[#44474e] hover:text-[#000a1e] px-3 py-1.5 rounded-lg border border-[#c4c6cf] transition"
        >
          Cancel
        </Link>
      </div>

      {formError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {formSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">Certification and certificate document saved! Redirecting...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474e]">
            Student USN *
          </label>
          <input
            type="text"
            list="students-list"
            value={usn}
            onChange={(e) => setUsn(e.target.value.toUpperCase())}
            placeholder="e.g. 1GA22CS001"
            required
            className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-[#0d1c2e] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          />
          <datalist id="students-list">
            {students.map((s) => (
              <option key={s.id} value={s.usn}>
                {s.name} ({s.departmentCode})
              </option>
            ))}
          </datalist>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474e]">
            Certification Title *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. AWS Certified Solutions Architect"
            required
            className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-[#0d1c2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474e] flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#0058be]" />
            Issuing Organization *
          </label>
          <input
            type="text"
            value={issuingOrganization}
            onChange={(e) => setIssuingOrganization(e.target.value)}
            placeholder="e.g. Amazon Web Services, NPTEL, Cisco"
            required
            className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-[#0d1c2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474e] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#0058be]" />
            Issue Date *
          </label>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-[#0d1c2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474e] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#74777f]" />
            Expiry Date (Optional)
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-[#0d1c2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474e]">
            Credential ID / Badge ID
          </label>
          <input
            type="text"
            value={credentialId}
            onChange={(e) => setCredentialId(e.target.value)}
            placeholder="e.g. AWS-PSA-123456"
            className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-[#0d1c2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474e]">
            Verification Link / Credly URL
          </label>
          <input
            type="url"
            value={credentialUrl}
            onChange={(e) => setCredentialUrl(e.target.value)}
            placeholder="https://www.credly.com/badges/..."
            className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-[#0d1c2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          />
        </div>
      </div>

      {/* Certificate Upload */}
      <div className="rounded-2xl bg-[#eff4ff]/60 border border-[#adc6ff]/70 p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#002147] flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#0058be]" />
          Certificate File Upload (PDF / Image)
        </h3>

        {uploadError && (
          <div className="p-3 rounded-lg bg-red-100 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{uploadError}</span>
          </div>
        )}

        {!certificateUrl ? (
          <label
            className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition ${
              isUploading
                ? "bg-[#e2edff] border-[#0058be]/40 cursor-wait"
                : "bg-white border-[#0058be]/30 hover:border-[#0058be] hover:bg-[#f0f6ff]"
            }`}
          >
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-7 h-7 text-[#0058be] animate-spin" />
                <span className="text-xs font-semibold text-[#002147]">Uploading &amp; processing certificate...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#0058be]">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-[#002147]">
                  Upload Certificate Document (PDF or Image)
                </p>
                <p className="text-[11px] text-[#74777f]">
                  PDF, PNG, JPG up to 10MB
                </p>
              </div>
            )}
          </label>
        ) : (
          <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-emerald-300 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#000a1e] truncate">
                  {certificateFileName || "Attached Certificate File"}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  {certificateFileSize ? `${certificateFileSize} • ` : ""}Attached successfully
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-[#0058be] hover:underline bg-[#eff4ff] px-2.5 py-1.5 rounded-lg border border-[#adc6ff]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Preview
              </a>
              <button
                type="button"
                onClick={() => {
                  setCertificateUrl("")
                  setCertificateFileName("")
                  setCertificateFileSize("")
                }}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#eff4ff]">
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
            href="/certifications"
            className="px-5 py-2.5 rounded-xl border border-[#c4c6cf] text-xs font-semibold text-[#44474e] hover:bg-[#f8f9ff] transition"
          >
            Cancel
          </Link>
        )}
        <button
          type="submit"
          disabled={isSubmitting || formSuccess}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#002147] hover:bg-[#003166] text-white text-xs font-bold tracking-wide transition shadow-md shadow-[#002147]/20 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Save Certification
            </>
          )}
        </button>
      </div>
    </form>
  )
}
