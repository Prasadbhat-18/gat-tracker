import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { createAuditLog } from "@/lib/audit"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const drives = await prisma.placementDrive.findMany({
    include: {
      company: { select: { name: true, industry: true } },
      _count: { select: { placements: true } },
    },
    orderBy: { driveDate: "desc" },
  })

  return NextResponse.json(drives)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const canEdit = ["SUPER_ADMIN", "HOD", "PLACEMENT_OFFICER"].includes(session.user.role)
  if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const body = await req.json()
    let companyId = body.companyId

    if (!companyId && body.companyName) {
      const comp = await prisma.company.upsert({
        where: { name: String(body.companyName).trim() },
        update: {},
        create: { name: String(body.companyName).trim() },
      })
      companyId = comp.id
    }

    if (!companyId) {
      return NextResponse.json({ error: "Company selection is required" }, { status: 400 })
    }

    if (!body.driveName) {
      return NextResponse.json({ error: "Drive name is required" }, { status: 400 })
    }

    let driveDate: Date | null = null
    if (body.driveDate) {
      const parsed = new Date(body.driveDate)
      if (!isNaN(parsed.getTime())) driveDate = parsed
    }

    let jobRole = "Software Engineer"
    if (body.jobRole) {
      jobRole = String(body.jobRole).trim()
    } else if (Array.isArray(body.jobRoles) && body.jobRoles.length > 0) {
      jobRole = body.jobRoles.join(", ")
    } else if (typeof body.jobRoles === "string" && body.jobRoles.trim()) {
      jobRole = body.jobRoles.trim()
    }

    const ctcOffered = body.ctcOffered ? parseFloat(body.ctcOffered) : body.ctcMin ? parseFloat(body.ctcMin) : null

    const drive = await prisma.placementDrive.create({
      data: {
        companyId,
        driveName: String(body.driveName).trim(),
        academicYear: body.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        driveDate,
        jobRole,
        minCgpa: body.minCgpa ? parseFloat(body.minCgpa) : null,
        maxBacklogs: body.maxBacklogs ? parseInt(body.maxBacklogs) : 0,
        ctcOffered,
        description: body.description || null,
        isActive: true,
      },
      include: {
        company: { select: { name: true } },
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      module: "placement-drives",
      recordId: drive.id,
      recordDesc: `Scheduled campus placement drive: ${drive.driveName} with ${(drive as any).company?.name ?? companyId}`,
    })

    return NextResponse.json(drive, { status: 201 })
  } catch (error: any) {
    console.error("Failed to create placement drive:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to create placement drive" },
      { status: 500 }
    )
  }
}
