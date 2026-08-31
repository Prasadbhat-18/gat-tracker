import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = new Date(date)
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatCTC(ctc: number | null | undefined): string {
  if (!ctc) return "—"
  return `₹${ctc.toFixed(2)} LPA`
}

export function getStudentYear(admissionYear: number): number {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  // Academic year starts in August
  const academicYear = currentMonth >= 8 ? currentYear : currentYear - 1
  const year = academicYear - admissionYear + 1
  return Math.min(Math.max(year, 1), 4)
}

export function formatAcademicYear(admissionYear: number): string {
  return `${admissionYear}-${admissionYear + 4}`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
}
