"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { InternshipForm } from "./InternshipForm"
import { X } from "lucide-react"

interface StudentOption {
  id: string
  usn: string
  name: string
  departmentCode: string
}

interface InternshipModalProps {
  students: StudentOption[]
  buttonText?: string
  buttonClassName?: string
}

export function InternshipModal({
  students,
  buttonText = "Add Internship",
  buttonClassName,
}: InternshipModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setIsOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          buttonClassName ||
          "flex items-center gap-2 bg-[#000a1e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#002147] transition-colors shadow-sm cursor-pointer"
        }
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        {buttonText}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-[#c4c6cf]">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <InternshipForm
              students={students}
              onSuccess={handleSuccess}
              onCancel={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
