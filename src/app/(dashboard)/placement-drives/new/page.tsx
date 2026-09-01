import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Schedule Placement Drive",
}

export default async function NewPlacementDrivePage() {
  const session = await auth()
  if (!session) redirect("/login")

  const canEdit = ["SUPER_ADMIN", "HOD", "PLACEMENT_OFFICER"].includes(session.user.role)
  if (!canEdit) redirect("/placement-drives")

  const companies = await prisma.company.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <PlacementDriveFormClient companies={companies} />
    </div>
  )
}

function PlacementDriveFormClient({ companies }: { companies: { id: string; name: string }[] }) {
  return <PlacementDriveFormInner companies={companies} />
}

import { PlacementDriveFormInner } from "@/components/placement-drives/PlacementDriveFormInner"
