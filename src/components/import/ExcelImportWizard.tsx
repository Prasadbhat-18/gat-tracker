"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { showToast } from "@/components/ui/toaster"
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RefreshCw,
  FileText,
  Users,
  Trophy,
  Award,
  Briefcase,
  FolderKanban,
  Check,
  ChevronRight,
  Info,
} from "lucide-react"
import { TemplateType } from "@/lib/excel-templates"
import { ImportPreviewResult, ImportExecutionResult } from "@/lib/excel-import"

interface Props {
  userRole: string
  userDeptName?: string
}

export function ExcelImportWizard({ userRole, userDeptName }: Props) {
  const [activeType, setActiveType] = useState<TemplateType>("all")
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [step, setStep] = useState<"upload" | "preview" | "completed">("upload")
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [previewData, setPreviewData] = useState<ImportPreviewResult | null>(null)
  const [importResult, setImportResult] = useState<ImportExecutionResult | null>(null)
  const [activePreviewTab, setActivePreviewTab] = useState<string>("students")
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const templateCards: Array<{
    type: TemplateType
    title: string
    desc: string
    icon: any
    tag: string
  }> = [
    {
      type: "all",
      title: "All-in-One Master Sheet",
      desc: "Multi-sheet workbook: Students, Activities, Certs, Internships & Projects together",
      icon: FileSpreadsheet,
      tag: "Recommended",
    },
    {
      type: "students",
      title: "Students Master Data",
      desc: "USN, Full Name, Department, Batch, Year, Section, CGPA, Placement Status",
      icon: Users,
      tag: "Core Data",
    },
    {
      type: "achievements",
      title: "Activities & Achievements",
      desc: "Hackathons, Competitions, Publications, Sports, Cultural, Awards & Patents",
      icon: Trophy,
      tag: "Extracurricular",
    },
    {
      type: "certifications",
      title: "Certifications & MOOCs",
      desc: "AWS, Google Cloud, Azure, NPTEL, Coursera, Oracle, Cisco badges",
      icon: Award,
      tag: "Credentials",
    },
    {
      type: "internships",
      title: "Industry Internships",
      desc: "Company, Role, Stipend, Duration, Start/End Dates & Status",
      icon: Briefcase,
      tag: "Industry",
    },
    {
      type: "projects",
      title: "Academic & Mini Projects",
      desc: "Project Titles, Tech Stacks, Faculty Guides, GitHub & Live URLs",
      icon: FolderKanban,
      tag: "Academic",
    },
  ]

  const handleDownloadTemplate = async (typeToDownload: TemplateType) => {
    setIsDownloadingTemplate(true)
    try {
      const res = await fetch(`/api/import/template?type=${typeToDownload}`)
      if (!res.ok) throw new Error("Download failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const contentDisposition = res.headers.get("content-disposition") ?? ""
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      a.download = filenameMatch?.[1] ?? `GAT_${typeToDownload}_Template.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      showToast({
        title: "Template Downloaded",
        description: "Open the file in Excel, fill in the records, and upload it here.",
        variant: "success",
      })
    } catch {
      showToast({
        title: "Download Failed",
        description: "Could not generate the template. Please try again.",
        variant: "error",
      })
    } finally {
      setIsDownloadingTemplate(false)
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      showToast({
        title: "Invalid File Type",
        description: "Please upload an Excel (.xlsx, .xls) or CSV spreadsheet file.",
        variant: "error",
      })
      return
    }
    setFile(selectedFile)
    analyzeFile(selectedFile)
  }

  const analyzeFile = async (fileToAnalyze: File) => {
    setIsLoadingPreview(true)
    try {
      const formData = new FormData()
      formData.append("file", fileToAnalyze)

      const res = await fetch("/api/import/preview", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.details || errorData.error || "Failed to analyze file")
      }

      const data: ImportPreviewResult = await res.json()
      setPreviewData(data)
      setStep("preview")

      // Automatically focus on tab with records
      if (data.students.total > 0) setActivePreviewTab("students")
      else if (data.achievements.total > 0) setActivePreviewTab("achievements")
      else if (data.certifications.total > 0) setActivePreviewTab("certifications")
      else if (data.internships.total > 0) setActivePreviewTab("internships")
      else if (data.projects.total > 0) setActivePreviewTab("projects")

      showToast({
        title: "Spreadsheet Analyzed",
        description: `Parsed ${data.totalRows} records across ${data.sheetNames.length} sheet(s).`,
        variant: "default",
      })
    } catch (err: any) {
      showToast({
        title: "Analysis Failed",
        description: err?.message || "Could not parse spreadsheet.",
        variant: "error",
      })
      setFile(null)
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const handleExecuteImport = async () => {
    if (!file) return
    setIsImporting(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.details || errData.error || "Bulk import failed")
      }

      const result: ImportExecutionResult = await res.json()
      setImportResult(result)
      setStep("completed")

      showToast({
        title: "Bulk Import Successful!",
        description: `Successfully imported records into database.`,
        variant: "success",
      })
    } catch (err: any) {
      showToast({
        title: "Import Execution Failed",
        description: err?.message || "Failed to import rows into database.",
        variant: "error",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const resetWizard = () => {
    setFile(null)
    setPreviewData(null)
    setImportResult(null)
    setStep("upload")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2 border-b border-[#c4c6cf]/60">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#d6e3ff] text-[#001b3d] text-xs font-semibold px-3 py-1 rounded-full mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#0058be]" />
            Bulk Excel Ingestion Engine
          </div>
          <h1 className="text-3xl font-bold text-[#000a1e] tracking-tight">
            Bulk Data Import
          </h1>
          <p className="text-sm text-[#44474e] mt-1">
            Faculty &amp; Administrator portal to upload students, achievements, internships, certifications, and project records in bulk.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#c4c6cf] shadow-sm text-xs font-semibold">
          <span
            className={`flex items-center gap-1.5 ${
              step === "upload" ? "text-[#0058be]" : "text-emerald-700"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === "upload" ? "bg-[#0058be] text-white" : "bg-emerald-100 text-emerald-700"}`}>
              {step === "upload" ? "1" : <Check className="w-3 h-3" />}
            </span>
            Upload File
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#74777f]" />
          <span
            className={`flex items-center gap-1.5 ${
              step === "preview"
                ? "text-[#0058be]"
                : step === "completed"
                ? "text-emerald-700"
                : "text-[#74777f]"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === "preview" ? "bg-[#0058be] text-white" : step === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-[#eff4ff] text-[#74777f]"}`}>
              {step === "completed" ? <Check className="w-3 h-3" /> : "2"}
            </span>
            Preview &amp; Validate
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#74777f]" />
          <span
            className={`flex items-center gap-1.5 ${
              step === "completed" ? "text-emerald-700" : "text-[#74777f]"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === "completed" ? "bg-emerald-600 text-white" : "bg-[#eff4ff] text-[#74777f]"}`}>
              3
            </span>
            Complete
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          STEP 1: UPLOAD & TEMPLATE SELECTION
         ───────────────────────────────────────────── */}
      {step === "upload" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Category Cards */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-[#000a1e] flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-[#0058be]">style</span>
                1. Select Import Format &amp; Download Pre-Formatted Excel Template
              </h2>
              <button
                onClick={() => handleDownloadTemplate(activeType)}
                disabled={isDownloadingTemplate}
                className="inline-flex items-center gap-2 bg-[#000a1e] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#002147] transition shadow-sm disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                {isDownloadingTemplate ? "Preparing..." : `Download ${activeType === "all" ? "Master" : activeType} Template (.xlsx)`}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templateCards.map((card) => {
                const Icon = card.icon
                const isSelected = activeType === card.type
                return (
                  <div
                    key={card.type}
                    onClick={() => setActiveType(card.type)}
                    className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-[#0058be] bg-[#eff4ff] shadow-md ring-2 ring-[#0058be]/20"
                        : "border-[#c4c6cf] bg-white hover:border-[#0058be]/50 hover:bg-[#f8f9ff]"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className={`p-2.5 rounded-lg ${isSelected ? "bg-[#002147] text-white" : "bg-[#eff4ff] text-[#0058be]"}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? "bg-[#0058be] text-white" : "bg-[#e6eeff] text-[#004395]"}`}>
                          {card.tag}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#000a1e]">{card.title}</h3>
                      <p className="text-xs text-[#44474e] mt-1 line-clamp-2 leading-relaxed">{card.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#c4c6cf]/40 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#0058be] flex items-center gap-1">
                        {isSelected ? "Selected Format" : "Select Format"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadTemplate(card.type)
                        }}
                        title="Download sample spreadsheet"
                        className="p-1 rounded hover:bg-white text-[#44474e] hover:text-[#0058be] transition"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upload Drop Zone */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#000a1e] flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-[#0058be]">cloud_upload</span>
              2. Upload Completed Excel Spreadsheet
            </h2>

            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                if (e.dataTransfer.files?.[0]) {
                  handleFileSelect(e.dataTransfer.files[0])
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[260px] ${
                isDragging
                  ? "border-[#0058be] bg-[#d6e3ff]/30 scale-[1.005]"
                  : "border-[#c4c6cf] bg-white hover:border-[#0058be] hover:bg-[#f8f9ff]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect(e.target.files[0])
                  }
                }}
              />

              <div className="w-16 h-16 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#0058be] mb-4 border border-[#c4c6cf]">
                {isLoadingPreview ? (
                  <RefreshCw className="w-8 h-8 animate-spin text-[#0058be]" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>

              <h3 className="text-base font-bold text-[#000a1e] mb-1">
                {isLoadingPreview ? "Analyzing Spreadsheet..." : "Drop your Excel spreadsheet here, or Browse"}
              </h3>
              <p className="text-xs text-[#44474e] max-w-md mb-4">
                Supports Microsoft Excel (.xlsx, .xls) and CSV files. Pre-checks for duplicates, USN formats, and validates relationships before saving.
              </p>

              <div className="inline-flex items-center gap-2 bg-[#eff4ff] text-[#004395] px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-[#c4c6cf]/60">
                <FileSpreadsheet className="w-4 h-4" />
                Click to Select File
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          STEP 2: DATA PREVIEW & LIVE VALIDATION
         ───────────────────────────────────────────── */}
      {step === "preview" && previewData && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-[#c4c6cf] rounded-xl p-4 shadow-sm">
              <span className="text-xs font-semibold text-[#44474e] uppercase tracking-wider">Total Rows Parsed</span>
              <p className="text-2xl font-bold text-[#000a1e] mt-1">{previewData.totalRows}</p>
              <p className="text-[11px] text-[#74777f] mt-0.5">{previewData.sheetNames.length} Worksheet(s)</p>
            </div>

            <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Ready to Import
              </span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{previewData.validRows}</p>
              <p className="text-[11px] text-emerald-600 mt-0.5">Validated against DB</p>
            </div>

            <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Students Summary
              </span>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                +{previewData.students.toCreate}{" "}
                <span className="text-sm font-normal text-blue-500">new / {previewData.students.toUpdate} updates</span>
              </p>
              <p className="text-[11px] text-blue-600 mt-0.5">USN matching enabled</p>
            </div>

            <div className={`bg-white border rounded-xl p-4 shadow-sm ${previewData.errorCount > 0 ? "border-rose-300 bg-rose-50/20" : "border-[#c4c6cf]"}`}>
              <span className="text-xs font-semibold text-[#44474e] uppercase tracking-wider flex items-center gap-1">
                {previewData.errorCount > 0 ? (
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                ) : (
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                )}
                Warnings / Errors
              </span>
              <p className={`text-2xl font-bold mt-1 ${previewData.errorCount > 0 ? "text-rose-600" : "text-amber-700"}`}>
                {previewData.errorCount} <span className="text-sm font-normal text-amber-600">/ {previewData.warningCount} warn</span>
              </p>
              <p className="text-[11px] text-[#74777f] mt-0.5">
                {previewData.errorCount > 0 ? "Critical issues will be skipped" : "Ready to proceed"}
              </p>
            </div>
          </div>

          {/* Validation Warnings/Errors Banner */}
          {previewData.errors.length > 0 && (
            <div className="bg-white border border-[#c4c6cf] rounded-xl p-4 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-[#000a1e] uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Diagnostics &amp; Validation Messages ({previewData.errors.length})
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
                {previewData.errors.map((err, idx) => (
                  <div
                    key={idx}
                    className={`text-xs p-2.5 rounded-lg flex items-start gap-2.5 ${
                      err.severity === "error"
                        ? "bg-rose-50 border border-rose-200 text-rose-800"
                        : "bg-amber-50 border border-amber-200 text-amber-800"
                    }`}
                  >
                    <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-white border border-current flex-shrink-0">
                      {err.sheet} · Row {err.row}
                    </span>
                    <span className="flex-1 leading-relaxed">
                      {err.field && <strong>[{err.field}] </strong>}
                      {err.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sheet Preview Tabs */}
          <div className="bg-white border border-[#c4c6cf] rounded-xl shadow-sm overflow-hidden">
            <div className="bg-[#f8f9ff] border-b border-[#c4c6cf] px-4 pt-3 flex gap-2 overflow-x-auto">
              {previewData.students.total > 0 && (
                <button
                  onClick={() => setActivePreviewTab("students")}
                  className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                    activePreviewTab === "students"
                      ? "border-[#0058be] text-[#0058be]"
                      : "border-transparent text-[#44474e] hover:text-[#000a1e]"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Students ({previewData.students.total})
                </button>
              )}

              {previewData.achievements.total > 0 && (
                <button
                  onClick={() => setActivePreviewTab("achievements")}
                  className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                    activePreviewTab === "achievements"
                      ? "border-[#0058be] text-[#0058be]"
                      : "border-transparent text-[#44474e] hover:text-[#000a1e]"
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  Achievements ({previewData.achievements.total})
                </button>
              )}

              {previewData.certifications.total > 0 && (
                <button
                  onClick={() => setActivePreviewTab("certifications")}
                  className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                    activePreviewTab === "certifications"
                      ? "border-[#0058be] text-[#0058be]"
                      : "border-transparent text-[#44474e] hover:text-[#000a1e]"
                  }`}
                >
                  <Award className="w-4 h-4" />
                  Certifications ({previewData.certifications.total})
                </button>
              )}

              {previewData.internships.total > 0 && (
                <button
                  onClick={() => setActivePreviewTab("internships")}
                  className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                    activePreviewTab === "internships"
                      ? "border-[#0058be] text-[#0058be]"
                      : "border-transparent text-[#44474e] hover:text-[#000a1e]"
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Internships ({previewData.internships.total})
                </button>
              )}

              {previewData.projects.total > 0 && (
                <button
                  onClick={() => setActivePreviewTab("projects")}
                  className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                    activePreviewTab === "projects"
                      ? "border-[#0058be] text-[#0058be]"
                      : "border-transparent text-[#44474e] hover:text-[#000a1e]"
                  }`}
                >
                  <FolderKanban className="w-4 h-4" />
                  Projects ({previewData.projects.total})
                </button>
              )}
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto max-h-96">
              {activePreviewTab === "students" && (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#f8f9ff] text-[#44474e] font-semibold sticky top-0 border-b border-[#c4c6cf]">
                    <tr>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">USN</th>
                      <th className="py-2.5 px-3">Full Name</th>
                      <th className="py-2.5 px-3">Dept</th>
                      <th className="py-2.5 px-3">Batch</th>
                      <th className="py-2.5 px-3">Year</th>
                      <th className="py-2.5 px-3">CGPA</th>
                      <th className="py-2.5 px-3">Placement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eff4ff]">
                    {previewData.students.preview.map((s, idx) => (
                      <tr key={idx} className="hover:bg-[#f8f9ff]">
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.action === "create" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
                            {s.action === "create" ? "+ New" : "↻ Update"}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-[#002147]">{s.usn}</td>
                        <td className="py-2 px-3 font-medium text-[#000a1e]">{s.name}</td>
                        <td className="py-2 px-3">{s.departmentCode}</td>
                        <td className="py-2 px-3">{s.batchName}</td>
                        <td className="py-2 px-3">Year {s.currentYear}</td>
                        <td className="py-2 px-3 font-bold">{s.cgpa?.toFixed(2) ?? "—"}</td>
                        <td className="py-2 px-3">{s.placementStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activePreviewTab === "achievements" && (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#f8f9ff] text-[#44474e] font-semibold sticky top-0 border-b border-[#c4c6cf]">
                    <tr>
                      <th className="py-2.5 px-3">Student USN</th>
                      <th className="py-2.5 px-3">Achievement Title</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Level</th>
                      <th className="py-2.5 px-3">Organization</th>
                      <th className="py-2.5 px-3">Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eff4ff]">
                    {previewData.achievements.preview.map((a, idx) => (
                      <tr key={idx} className="hover:bg-[#f8f9ff]">
                        <td className="py-2 px-3 font-mono font-bold text-[#002147]">{a.usn}</td>
                        <td className="py-2 px-3 font-medium text-[#000a1e]">{a.title}</td>
                        <td className="py-2 px-3">
                          <span className="bg-[#eff4ff] text-[#004395] px-2 py-0.5 rounded font-medium text-[10px]">
                            {a.category}
                          </span>
                        </td>
                        <td className="py-2 px-3">{a.level ?? "—"}</td>
                        <td className="py-2 px-3">{a.organization ?? "—"}</td>
                        <td className="py-2 px-3 font-semibold">{a.position ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activePreviewTab === "certifications" && (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#f8f9ff] text-[#44474e] font-semibold sticky top-0 border-b border-[#c4c6cf]">
                    <tr>
                      <th className="py-2.5 px-3">Student USN</th>
                      <th className="py-2.5 px-3">Certification</th>
                      <th className="py-2.5 px-3">Organization</th>
                      <th className="py-2.5 px-3">Credential ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eff4ff]">
                    {previewData.certifications.preview.map((c, idx) => (
                      <tr key={idx} className="hover:bg-[#f8f9ff]">
                        <td className="py-2 px-3 font-mono font-bold text-[#002147]">{c.usn}</td>
                        <td className="py-2 px-3 font-medium text-[#000a1e]">{c.name}</td>
                        <td className="py-2 px-3">{c.issuingOrg}</td>
                        <td className="py-2 px-3 font-mono">{c.credentialId ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activePreviewTab === "internships" && (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#f8f9ff] text-[#44474e] font-semibold sticky top-0 border-b border-[#c4c6cf]">
                    <tr>
                      <th className="py-2.5 px-3">Student USN</th>
                      <th className="py-2.5 px-3">Company</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Stipend</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eff4ff]">
                    {previewData.internships.preview.map((i, idx) => (
                      <tr key={idx} className="hover:bg-[#f8f9ff]">
                        <td className="py-2 px-3 font-mono font-bold text-[#002147]">{i.usn}</td>
                        <td className="py-2 px-3 font-medium text-[#000a1e]">{i.company}</td>
                        <td className="py-2 px-3">{i.role}</td>
                        <td className="py-2 px-3">{i.durationWeeks ? `${i.durationWeeks} weeks` : "—"}</td>
                        <td className="py-2 px-3 font-bold">{i.stipend ? `₹${i.stipend}` : "Unpaid"}</td>
                        <td className="py-2 px-3">{i.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activePreviewTab === "projects" && (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#f8f9ff] text-[#44474e] font-semibold sticky top-0 border-b border-[#c4c6cf]">
                    <tr>
                      <th className="py-2.5 px-3">Student USN</th>
                      <th className="py-2.5 px-3">Project Title</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Technologies</th>
                      <th className="py-2.5 px-3">Guide</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eff4ff]">
                    {previewData.projects.preview.map((p, idx) => (
                      <tr key={idx} className="hover:bg-[#f8f9ff]">
                        <td className="py-2 px-3 font-mono font-bold text-[#002147]">{p.usn}</td>
                        <td className="py-2 px-3 font-medium text-[#000a1e]">{p.title}</td>
                        <td className="py-2 px-3">{p.projectType}</td>
                        <td className="py-2 px-3">{p.technologies.join(", ") || "—"}</td>
                        <td className="py-2 px-3">{p.facultyGuide ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-[#c4c6cf]">
            <button
              onClick={resetWizard}
              disabled={isImporting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-[#c4c6cf] text-[#44474e] hover:bg-[#eff4ff] text-xs font-semibold transition"
            >
              Cancel &amp; Upload Different File
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleExecuteImport}
                disabled={isImporting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#000a1e] text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-[#002147] transition shadow-md disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Committing to Database...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirm &amp; Import All {previewData.validRows} Records
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          STEP 3: COMPLETED RESULTS SUMMARY
         ───────────────────────────────────────────── */}
      {step === "completed" && importResult && (
        <div className="bg-white border border-[#c4c6cf] rounded-2xl p-8 shadow-sm space-y-6 animate-in zoom-in-95 duration-300">
          <div className="text-center max-w-md mx-auto space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#000a1e]">Bulk Ingestion Complete!</h2>
            <p className="text-xs text-[#44474e]">
              Spreadsheet records have been processed, cross-verified, and stored into the institutional database.
            </p>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
            <div className="bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl p-3.5 text-center">
              <span className="text-[11px] font-semibold text-[#44474e] uppercase">Students Created</span>
              <p className="text-xl font-bold text-emerald-700 mt-1">+{importResult.summary.studentsCreated}</p>
            </div>
            <div className="bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl p-3.5 text-center">
              <span className="text-[11px] font-semibold text-[#44474e] uppercase">Students Updated</span>
              <p className="text-xl font-bold text-blue-700 mt-1">{importResult.summary.studentsUpdated}</p>
            </div>
            <div className="bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl p-3.5 text-center">
              <span className="text-[11px] font-semibold text-[#44474e] uppercase">Achievements</span>
              <p className="text-xl font-bold text-[#000a1e] mt-1">{importResult.summary.achievementsCreated}</p>
            </div>
            <div className="bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl p-3.5 text-center">
              <span className="text-[11px] font-semibold text-[#44474e] uppercase">Certifications</span>
              <p className="text-xl font-bold text-[#000a1e] mt-1">{importResult.summary.certificationsCreated}</p>
            </div>
            <div className="bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl p-3.5 text-center">
              <span className="text-[11px] font-semibold text-[#44474e] uppercase">Internships</span>
              <p className="text-xl font-bold text-[#000a1e] mt-1">{importResult.summary.internshipsCreated}</p>
            </div>
            <div className="bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl p-3.5 text-center">
              <span className="text-[11px] font-semibold text-[#44474e] uppercase">Projects</span>
              <p className="text-xl font-bold text-[#000a1e] mt-1">{importResult.summary.projectsCreated}</p>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="flex flex-wrap justify-center items-center gap-4 pt-6 border-t border-[#eff4ff]">
            <Link
              href="/students"
              className="flex items-center gap-2 bg-[#000a1e] text-white px-6 py-2.5 rounded-lg text-xs font-semibold hover:bg-[#002147] transition shadow-sm"
            >
              <Users className="w-4 h-4" />
              View Students Table
            </Link>

            <Link
              href="/achievements"
              className="flex items-center gap-2 bg-white border border-[#c4c6cf] text-[#000a1e] px-6 py-2.5 rounded-lg text-xs font-semibold hover:bg-[#eff4ff] transition shadow-sm"
            >
              <Trophy className="w-4 h-4" />
              View Achievements
            </Link>

            <button
              onClick={resetWizard}
              className="flex items-center gap-2 bg-[#eff4ff] text-[#0058be] px-6 py-2.5 rounded-lg text-xs font-semibold hover:bg-[#d6e3ff] transition"
            >
              <RefreshCw className="w-4 h-4" />
              Upload Another Excel File
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
