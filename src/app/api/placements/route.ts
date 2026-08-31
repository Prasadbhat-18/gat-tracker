import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { createAuditLog } from "@/lib/audit"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["SUPER_ADMIN", "HOD", "PLACEMENT_OFFICER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const placement = await prisma.placement.create({
      data: { ...body, addedById: session.user.id },
    })

    // Update student placement status if this is accepted
    if (body.offerStatus === "ACCEPTED" || body.isFinalAccepted) {
      await prisma.student.update({
        where: { id: body.studentId },
        data: { placementStatus: "PLACED", careerOutcome: "PLACED" },
      })
    }

    const student = await prisma.student.findUnique({
      where: { id: body.studentId },
      select: { name: true, usn: true },
    })
    const company = await prisma.company.findUnique({
      where: { id: body.companyId },
      select: { name: true },
    })

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      module: "placements",
      recordId: placement.id,
      recordDesc: `${student?.name} (${student?.usn}) placed at ${company?.name} — ₹${body.ctc} LPA`,
    })

    return NextResponse.json(placement, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to record placement" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const where: Record<string, unknown> = {}

  if (session.user.role === "HOD" && session.user.departmentId) {
    where.student = { departmentId: session.user.departmentId }
  }

  const dept = searchParams.get("dept")
  const batch = searchParams.get("batch")
  const company = searchParams.get("company")

  if (dept && session.user.role === "SUPER_ADMIN") {
    where.student = { ...(where.student as object ?? {}), departmentId: dept }
  }
  if (batch) where.student = { ...(where.student as object ?? {}), batchId: batch }
  if (company) where.companyId = company

  const placements = await prisma.placement.findMany({
    where,
    include: {
      student: {
        select: {
          name: true, usn: true,
          department: { select: { code: true } },
          batch: { select: { name: true } },
        },
      },
      company: { select: { name: true, industry: true } },
      drive: { select: { driveName: true, academicYear: true } },
      addedBy: { select: { name: true } },
    },
    orderBy: { offerDate: "desc" },
    take: 200,
  })

  return NextResponse.json(placements)
}
