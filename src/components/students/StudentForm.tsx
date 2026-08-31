"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { showToast } from "@/components/ui/toaster"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

interface StudentFormProps {
  departments: Array<{ id: string; name: string; code: string }>
  batches: Array<{ id: string; name: string; admissionYear: number }>
  userRole: string
  userDeptId?: string
}

export function StudentForm({ departments, batches, userRole, userDeptId }: StudentFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    usn: "",
    name: "",
    email: "",
    phone: "",
    departmentId: userDeptId || (departments[0]?.id ?? ""),
    batchId: batches[0]?.id ?? "",
    currentYear: 1,
    cgpa: "",
    section: "A",
    gender: "Male",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const selectedBatch = batches.find((b) => b.id === formData.batchId)
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          usn: formData.usn.trim().toUpperCase(),
          cgpa: formData.cgpa ? parseFloat(formData.cgpa) : undefined,
          admissionYear: selectedBatch?.admissionYear ?? new Date().getFullYear(),
          placementStatus: "ELIGIBLE",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to register student")
      }

      showToast({ title: "Student Registered", description: `${formData.name} (${formData.usn.toUpperCase()}) created.`, variant: "success" })
      router.push("/students")
      router.refresh()
    } catch (err: any) {
      showToast({ title: "Registration Failed", description: err.message, variant: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <Link href="/students" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Students
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            USN (University Seat Number) *
          </label>
          <input
            type="text"
            required
            placeholder="e.g., 1GA21CS001"
            value={formData.usn}
            onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Full Name *
          </label>
          <input
            type="text"
            required
            placeholder="Student official name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Department *
          </label>
          <select
            value={formData.departmentId}
            disabled={userRole === "HOD" && !!userDeptId}
            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Academic Batch *
          </label>
          <select
            value={formData.batchId}
            onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                Batch {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Current Engineering Year
          </label>
          <select
            value={formData.currentYear}
            onChange={(e) => setFormData({ ...formData, currentYear: parseInt(e.target.value) })}
            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value={1}>1st Year (BE)</option>
            <option value={2}>2nd Year (BE)</option>
            <option value={3}>3rd Year (BE)</option>
            <option value={4}>4th Year (BE)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Section / Division
          </label>
          <input
            type="text"
            placeholder="e.g. A, B, C"
            value={formData.section}
            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Cumulative CGPA
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="10"
            placeholder="e.g. 8.45"
            value={formData.cgpa}
            onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            placeholder="student@gat.edu.in"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="e.g. 9876543210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Gender
          </label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <Link href="/students" className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2 text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition font-medium disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Student Record"
          )}
        </button>
      </div>
    </form>
  )
}
