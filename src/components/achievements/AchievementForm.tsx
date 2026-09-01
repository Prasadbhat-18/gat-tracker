"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Award,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
  Calendar,
  Building2,
  Trophy,
} from "lucide-react"
import Link from "next/link"

interface StudentOption {
  id: string
  usn: string
  name: string
  departmentCode: string
}

interface AchievementFormProps {
  students: StudentOption[]
  preselectedUsn?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function AchievementForm({ students, preselectedUsn, onSuccess, onCancel }: AchievementFormProps) {
  const router = useRouter()
  const [usn, setUsn] = useState(preselectedUsn ?? (students[0]?.usn ?? ""))
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("HACKATHON")
  const [level, setLevel] = useState("NATIONAL")
  const [organizingBody, setOrganizingBody] = useState("")
  const [awardPosition, setAwardPosition] = useState("1st Place")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [description, setDescription] = useState("")
  
  // Certificate upload state
  const [certificateUrl, setCertificateUrl] = useState("")
  const [certificateFileName, setCertificateFileName] = useState("")
  const [certificateFileSize, setCertificateFileSize] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [useExternalLink, setUseExternalLink] = useState(false)

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState(false)

  // Handle Certificate File Upload
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
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload certificate file")
      }

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

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!usn) {
      setFormError("Please select or enter a valid Student USN.")
      return
    }

    if (!title.trim()) {
      setFormError("Achievement title is required.")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        usn: usn.trim().toUpperCase(),
        title: title.trim(),
        category,
        level,
        organizingBody: organizingBody.trim(),
        awardPosition: awardPosition.trim(),
        achievementDate: date,
        certificateUrl: certificateUrl.trim() || undefined,
        description: description.trim(),
      }

      const res = await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to record achievement")
      }

      setFormSuccess(true)
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/achievements")
          router.refresh()
        }
      }, 1000)
    } catch (err: any) {
      console.error(err)
      setFormError(err.message || "An error occurred while saving the achievement")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-[#c4c6cf] rounded-2xl p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="border-b border-[#eff4ff] pb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#000a1e] flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#eff4ff] border border-[#c4c6cf] flex items-center justify-center text-[#0058be]">
              <Award className="w-5 h-5" />
            </span>
            Record Student Achievement
          </h2>
          <p className="text-xs text-[#44474e] mt-1">
            Enter academic, competition, hackathon, or sports records and attach verified certificates.
          </p>
        </div>

        <Link
          href="/achievements"
          className="text-xs font-semibold text-[#44474e] hover:text-[#000a1e] px-3 py-1.5 rounded-lg border border-[#c4c6cf] transition"
        >
          Cancel
        </Link>
      </div>

      {/* Status Messages */}
      {formError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {formSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">Achievement and certificate successfully recorded! Redirecting...</span>
        </div>
      )}

      {/* Grid: Student Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Selector / USN */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474e]">
            Student USN *
          </label>
          <div className="relative">
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
          <p className="text-[11px] text-[#74777f]">
            Type USN or pick from list ({students.length} students loaded).
          </p>
        </div>

        {/* Achievement Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474e]">
            Achievement / Event Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Smart India Hackathon 2024 Winner"
            required
            className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-[#0d1c2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          />
        </div>
      </div>

      {/* Grid: Category & Level */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Category */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474e]">
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-[#0d1c2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          >
            <option value="HACKATHON">Hackathon</option>
            <option value="ACADEMIC">Academic Excellence</option>
            <option value="TECHNICAL">Technical Contest / Coding</option>
            <option value="PUBLICATION">Paper Publication</option>
            <option value="RESEARCH">Research Project</option>
            <option value="PATENT">Patent Filed/Granted</option>
            <option value="SPORTS">Sports & Athletics</option>
            <option value="CULTURAL">Cultural Event</option>
            <option value="LEADERSHIP">Leadership & Service</option>
            <option value="OTHER">Other Achievement</option>
          </select>
        </div>

        {/* Level */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474e]">
            Level *
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-[#0d1c2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          >
            <option value="INTERNATIONAL">International</option>
            <option value="NATIONAL">National</option>
            <option value="STATE">State Level</option>
            <option value="UNIVERSITY">University Level (VTU)</option>
            <option value="INTER_COLLEGE">Inter-College</option>
            <option value="COLLEGE">College Level</option>
            <option value="DEPARTMENT">Departmental</option>
          </select>
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474e] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#0058be]" />
            Achievement Date *
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-[#0d1c2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          />
        </div>
      </div>

      {/* Grid: Organizing Body & Position */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474e] flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#0058be]" />
            Organizing Body / Institution
          </label>
          <input
            type="text"
            value={organizingBody}
            onChange={(e) => setOrganizingBody(e.target.value)}
            placeholder="e.g. AICTE / IEEE / IIT Madras"
            className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-[#0d1c2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#44474e] flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-[#0058be]" />
            Award / Position / Rank
          </label>
          <input
            type="text"
            value={awardPosition}
            onChange={(e) => setAwardPosition(e.target.value)}
            placeholder="e.g. 1st Prize, Winner, Top 10, Special Recognition"
            className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-[#0d1c2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          />
        </div>
      </div>

      {/* Certificate Upload Section */}
      <div className="rounded-2xl bg-[#eff4ff]/60 border border-[#adc6ff]/70 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#002147] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0058be]" />
              Certificate Document / Verification Proof
            </h3>
            <p className="text-xs text-[#44474e]">
              Upload certificate PDF, PNG, or JPEG (up to 10MB) or provide a verifiable document URL.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setUseExternalLink(!useExternalLink)}
            className="text-xs text-[#0058be] hover:underline font-semibold self-start sm:self-auto"
          >
            {useExternalLink ? "Upload file directly instead" : "Use external link / URL instead"}
          </button>
        </div>

        {uploadError && (
          <div className="p-3 rounded-lg bg-red-100/80 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {useExternalLink ? (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#44474e]">
              External Certificate / Drive Link
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={certificateUrl}
                onChange={(e) => setCertificateUrl(e.target.value)}
                placeholder="https://drive.google.com/... or https://creds.example.com/cert/123"
                className="flex-1 px-3.5 py-2 bg-white border border-[#c4c6cf] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
              />
              {certificateUrl && (
                <a
                  href={certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-white border border-[#c4c6cf] rounded-xl text-xs font-semibold text-[#0058be] hover:bg-[#eff4ff] flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Test Link
                </a>
              )}
            </div>
          </div>
        ) : (
          <div>
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
                      Click to browse or drag certificate file here
                    </p>
                    <p className="text-[11px] text-[#74777f]">
                      Supported formats: PDF, JPG, PNG, WEBP (Max: 10MB)
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
                      {certificateFileName || "Attached Certificate Document"}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      {certificateFileSize ? `${certificateFileSize} • ` : ""}Ready for instant verification
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
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
                    title="Remove certificate"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description / Remarks */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#44474e]">
          Description / Project Summary (Optional)
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Briefly describe the competition project, team members, or problem statement solved..."
          className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-[#0d1c2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]"
        />
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
            href="/achievements"
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
              Saving Achievement...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Save Achievement &amp; Certificate
            </>
          )}
        </button>
      </div>
    </form>
  )
}
