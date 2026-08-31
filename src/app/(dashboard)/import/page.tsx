import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ExcelImportWizard } from "@/components/import/ExcelImportWizard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bulk Data Import",
  description: "Upload Excel spreadsheets containing student records, activities, certifications, internships, and projects.",
}

export default async function ImportPage() {
  const session = await auth()
  if (!session) redirect("/login")

  if (!["SUPER_ADMIN", "HOD", "FACULTY", "PLACEMENT_OFFICER"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  return (
    <ExcelImportWizard
      userRole={session.user.role}
      userDeptName={session.user.department?.name}
    />
  )
}
