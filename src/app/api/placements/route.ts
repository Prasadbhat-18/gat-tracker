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
    let studentId = body.studentId

    if (!studentId && body.usn) {
      const student = await prisma.student.findUnique({
        where: { usn: String(body.usn).trim().toUpperCase() },
        select: { id: true, usn: true, name: true },
      })
      if (!student) {
        return NextResponse.json({ error: `Student with USN '${body.usn}' not found` }, { status: 404 })
      }
      studentId = student.id
    }

    if (!studentId) {
      return NextResponse.json({ error: "Student USN or ID is required" }, { status: 400 })
    }

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

    let offerDate: Date | null = null
    if (body.offerDate) {
      const parsed = new Date(body.offerDate)
      if (!isNaN(parsed.getTime())) offerDate = parsed
    }

    let joiningDate: Date | null = null
    if (body.joiningDate) {
      const parsed = new Date(body.joiningDate)
      if (!isNaN(parsed.getTime())) joiningDate = parsed
    }

    const ctc = body.ctc ? parseFloat(body.ctc) : null

    const placement = await prisma.placement.create({
      data: {
        studentId,
        companyId,
        driveId: body.driveId || null,
        jobRole: String(body.jobRole || "Software Engineer").trim(),
        ctc,
        location: body.location || null,
        offerDate,
        joiningDate,
        offerStatus: body.offerStatus || "OFFERED",
        isFinalAccepted: Boolean(body.isFinalAccepted),
        offerLetterUrl: body.offerLetterUrl || body.certificateUrl || null,
        remarks: body.remarks || null,
        addedById: session.user.id,
      },
    })

    // Update student placement status if accepted or final
    if (body.offerStatus === "ACCEPTED" || body.isFinalAccepted) {
      await prisma.student.update({
        where: { id: studentId },
        data: { placementStatus: "PLACED", careerOutcome: "PLACED" },
      })
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { name: true, usn: true },
    })
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true },
    })

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      module: "placements",
      recordId: placement.id,
      recordDesc: `${student?.name} (${student?.usn}) placed at ${company?.name} — ₹${ctc ?? 0} LPA`,
    })

    return NextResponse.json(placement, { status: 201 })
  } catch (err: any) {
    console.error("Failed to record placement:", err)
    return NextResponse.json({ error: err?.message || "Failed to record placement" }, { status: 500 })
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
