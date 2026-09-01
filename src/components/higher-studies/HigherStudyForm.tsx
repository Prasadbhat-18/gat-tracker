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

interface HigherStudyFormProps {
  students: StudentOption[]
  preselectedUsn?: string
}

export function HigherStudyForm({ students, preselectedUsn }: HigherStudyFormProps) {
  const router = useRouter()
  const [usnInput, setUsnInput] = useState(preselectedUsn ?? "")
  const [institution, setInstitution] = useState("")
  const [program, setProgram] = useState("MS")
  const [specialization, setSpecialization] = useState("")
  const [country, setCountry] = useState("United States")
  const [admissionYear, setAdmissionYear] = useState(new Date().getFullYear().toString())
  const [examName, setExamName] = useState("GRE")
  const [examScore, setExamScore] = useState("")
  const [scholarshipInfo, setScholarshipInfo] = useState("")
  const [remarks, setRemarks] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const matchedStudent = students.find(
    (s) => s.usn.toUpperCase() === usnInput.trim().toUpperCase()
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    if (!usnInput.trim()) {
      setErrorMsg("Student USN is required")
      return
    }
    if (!institution.trim()) {
      setErrorMsg("University / Institution name is required")
      return
    }
    if (!program.trim()) {
      setErrorMsg("Degree program is required")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/higher-studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usn: usnInput.trim().toUpperCase(),
          institution: institution.trim(),
          program: program.trim(),
          specialization: specialization.trim() || null,
          country: country.trim() || null,
          admissionYear: admissionYear ? parseInt(admissionYear) : null,
          examName: examName.trim() || null,
          examScore: examScore.trim() || null,
          scholarshipInfo: scholarshipInfo.trim() || null,
          remarks: remarks.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to record higher studies")

      setSuccessMsg("Higher studies admission recorded successfully!")
      setTimeout(() => {
        router.push("/higher-studies")
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
            Graduate Studies & Academic Progression
          </span>
          <h1 className="text-xl font-bold mt-2 tracking-tight">Record Higher Studies Progression</h1>
          <p className="text-xs text-[#adc6ff] mt-0.5">
            Log university admissions, Masters/PhD programs, entrance exams, and scholarships
          </p>
        </div>
        <Link
          href="/higher-studies"
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

        {/* Institution & Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Admitted Institution / University <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. Carnegie Mellon University, IISc, TU Munich"
              required
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. United States, Germany, India, United Kingdom"
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>
        </div>

        {/* Program, Specialization, Year */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Degree Program <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder="e.g. MS, M.Tech, MBA, Ph.D"
              required
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Specialization / Major
            </label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g. Artificial Intelligence, Data Science"
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Admission Year
            </label>
            <input
              type="number"
              value={admissionYear}
              onChange={(e) => setAdmissionYear(e.target.value)}
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>
        </div>

        {/* Qualifying Exam & Score */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Entrance Exam
            </label>
            <select
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            >
              <option value="GRE">GRE</option>
              <option value="GATE">GATE</option>
              <option value="CAT">CAT</option>
              <option value="GMAT">GMAT</option>
              <option value="TOEFL">TOEFL</option>
              <option value="IELTS">IELTS</option>
              <option value="DIRECT">Direct Admit / University Entrance</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Exam Score / Percentile / Rank
            </label>
            <input
              type="text"
              value={examScore}
              onChange={(e) => setExamScore(e.target.value)}
              placeholder="e.g. 328/340 or AIR 420"
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>
        </div>

        {/* Scholarship & Remarks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Scholarship / Financial Grant
            </label>
            <input
              type="text"
              value={scholarshipInfo}
              onChange={(e) => setScholarshipInfo(e.target.value)}
              placeholder="e.g. Graduate Teaching Assistantship / $20,000"
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Remarks / Visa Status
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. F-1 Visa Approved"
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#eff4ff]">
          <Link
            href="/higher-studies"
            className="px-5 py-2.5 rounded-xl border border-[#c4c6cf] text-xs font-semibold text-[#44474e] hover:bg-[#f8f9ff] transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#000a1e] hover:bg-[#002147] text-white text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? "Saving..." : "Save Higher Studies Record"}
          </button>
        </div>
      </form>
    </div>
  )
}
