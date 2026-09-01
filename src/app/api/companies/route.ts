import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { createAuditLog } from "@/lib/audit"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
  })

  return NextResponse.json(companies)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const canEdit = ["SUPER_ADMIN", "HOD", "PLACEMENT_OFFICER"].includes(session.user.role)
  if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const body = await req.json()
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 })
    }

    const company = await prisma.company.create({
      data: {
        name: String(body.name).trim(),
        industry: body.industry?.trim() || null,
        website: body.website?.trim() || null,
        location: body.location?.trim() || null,
        description: body.description?.trim() || null,
        contactName: body.contactName?.trim() || null,
        contactEmail: body.contactEmail?.trim() || null,
        contactPhone: body.contactPhone?.trim() || null,
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      module: "companies",
      recordId: company.id,
      recordDesc: `Registered company partner: ${company.name}`,
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error: any) {
    console.error("Failed to create company:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to register company" },
      { status: 500 }
    )
  }
}
