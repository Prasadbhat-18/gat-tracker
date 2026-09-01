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

interface ProjectFormProps {
  students: StudentOption[]
  preselectedUsn?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProjectForm({ students, preselectedUsn, onSuccess, onCancel }: ProjectFormProps) {
  const router = useRouter()
  const [usnInput, setUsnInput] = useState(preselectedUsn ?? "")
  const [title, setTitle] = useState("")
  const [projectType, setProjectType] = useState("MINI_PROJECT")
  const [technologies, setTechnologies] = useState("")
  const [teamMembers, setTeamMembers] = useState("")
  const [facultyGuide, setFacultyGuide] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [demoUrl, setDemoUrl] = useState("")
  const [description, setDescription] = useState("")
  const [documentUrl, setDocumentUrl] = useState("")
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
      setDocumentUrl(data.url)
      setSelectedFile(file)
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload document")
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
    if (!title.trim()) {
      setErrorMsg("Project title is required")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usn: usnInput.trim().toUpperCase(),
          title: title.trim(),
          projectType,
          technologies,
          teamMembers,
          facultyGuide: facultyGuide.trim() || null,
          githubUrl: githubUrl.trim() || null,
          demoUrl: demoUrl.trim() || null,
          description: description.trim() || null,
          documentUrl: documentUrl.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save project")

      setSuccessMsg("Technical project recorded successfully!")
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/projects")
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
            Technical & Capstone Projects
          </span>
          <h1 className="text-xl font-bold mt-2 tracking-tight">Record Student Project</h1>
          <p className="text-xs text-[#adc6ff] mt-0.5">
            Log academic capstones, mini-projects, research projects, GitHub repositories, and report documents
          </p>
        </div>
        <Link
          href="/projects"
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
            Lead Student USN <span className="text-red-500">*</span>
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

        {/* Title & Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Autonomous Drone Navigation with Deep Q-Learning"
              required
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Project Type
            </label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            >
              <option value="CAPSTONE">Capstone / Final Year Project</option>
              <option value="MINI_PROJECT">Mini Project</option>
              <option value="RESEARCH">Research Project</option>
              <option value="HACKATHON">Hackathon Build</option>
              <option value="INTERNSHIP_PROJECT">Internship Project</option>
              <option value="COURSE_PROJECT">Course Project</option>
            </select>
          </div>
        </div>

        {/* Tech Stack & Team Members */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Technologies / Tools (Comma separated)
            </label>
            <input
              type="text"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="e.g. Python, PyTorch, ROS, React, Docker"
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Other Team Members USNs (Comma separated)
            </label>
            <input
              type="text"
              value={teamMembers}
              onChange={(e) => setTeamMembers(e.target.value)}
              placeholder="e.g. 1GA22CS002, 1GA22CS003"
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be] uppercase font-mono"
            />
          </div>
        </div>

        {/* Faculty Guide & URLs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Faculty Guide
            </label>
            <input
              type="text"
              value={facultyGuide}
              onChange={(e) => setFacultyGuide(e.target.value)}
              placeholder="e.g. Dr. Ramesh Babu"
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              GitHub Repository URL
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Live Demo / Video URL
            </label>
            <input
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
            Project Abstract / Deliverables Summary
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Key methodology, architecture, and project outcomes..."
            className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be] resize-none"
          />
        </div>

        {/* Document / Report Upload */}
        <div className="space-y-2 border-t border-[#eff4ff] pt-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Project Synopsis / Final Report Document
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition ${
                  uploadMode === "file" ? "bg-[#000a1e] text-white" : "bg-[#f8f9ff] text-[#44474e]"
                }`}
              >
                Upload File (PDF)
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
                id="project-doc-file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFileUpload(f)
                }}
                className="hidden"
              />
              <label htmlFor="project-doc-file" className="cursor-pointer block">
                <span className="material-symbols-outlined text-3xl text-[#0058be]">upload_file</span>
                <p className="text-xs font-semibold text-[#000a1e] mt-1">
                  {isUploading
                    ? "Uploading document..."
                    : selectedFile
                    ? `Uploaded: ${selectedFile.name}`
                    : "Click to upload Project Report / Synopsis (PDF up to 10MB)"}
                </p>
              </label>
            </div>
          ) : (
            <input
              type="url"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="https://drive.google.com/... or project documentation link"
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
              href="/projects"
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
            {isSubmitting ? "Saving..." : "Save Project Record"}
          </button>
        </div>
      </form>
    </div>
  )
}
