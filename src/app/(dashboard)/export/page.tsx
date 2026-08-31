"use client"

import { useState } from "react"
import { Download, Filter } from "lucide-react"
import { showToast } from "@/components/ui/toaster"

export default function ExportPage() {
  const [type, setType] = useState("students")
  const [dept, setDept] = useState("")
  const [batch, setBatch] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams({ type })
      if (dept) params.set("dept", dept)
      if (batch) params.set("batch", batch)

      const res = await fetch(`/api/export?${params}`)
      if (!res.ok) throw new Error("Export failed")

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const contentDisposition = res.headers.get("content-disposition") ?? ""
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      a.download = filenameMatch?.[1] ?? `GAT_Export_${type}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      showToast({ title: "Export successful", description: "Your Excel file is downloading.", variant: "success" })
    } catch {
      showToast({ title: "Export failed", description: "Please try again.", variant: "error" })
    } finally {
      setIsExporting(false)
    }
  }

  const exportTypes = [
    { value: "students", label: "Student Master Data", desc: "All student records with status" },
    { value: "placements", label: "Placements", desc: "All placement offers and outcomes" },
    { value: "achievements", label: "Achievements", desc: "Student achievements and awards" },
    { value: "all", label: "Complete Report", desc: "All data in separate worksheets" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Export Data</h1>
        <p className="text-sm text-gray-500 mt-0.5">Generate professionally formatted Excel reports</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Configure Export</h2>

        <div className="space-y-4">
          {/* Type selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Type</label>
            <div className="grid grid-cols-2 gap-3">
              {exportTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`text-left p-3 rounded-lg border-2 transition ${
                    type === t.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">{t.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Department (optional)</label>
              <input
                type="text"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                placeholder="Department ID..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Batch (optional)</label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="Batch ID..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>Output:</strong> GAT_{dept || "ALL"}_{batch || "ALL"}_{type}_Report_{new Date().toISOString().slice(0, 10)}.xlsx
            </p>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-60 transition text-sm font-medium"
          >
            {isExporting ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isExporting ? "Generating..." : "Download Excel"}
          </button>
        </div>
      </div>
    </div>
  )
}
