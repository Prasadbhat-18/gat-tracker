import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { createAuditLog } from "@/lib/audit"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const usn = searchParams.get("usn")
  const where: Record<string, unknown> = {}

  if (usn) where.student = { usn: usn.toUpperCase() }
  if (session.user.role !== "SUPER_ADMIN" && session.user.departmentId) {
    where.student = { ...(where.student as object ?? {}), departmentId: session.user.departmentId }
  }

  const internships = await prisma.internship.findMany({
    where,
    include: {
      student: {
        select: {
          name: true,
          usn: true,
          department: { select: { code: true } },
        },
      },
      addedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return NextResponse.json(internships)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const canEdit = ["SUPER_ADMIN", "HOD", "FACULTY", "PLACEMENT_OFFICER"].includes(session.user.role)
  if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

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

    if (!body.company || !body.role) {
      return NextResponse.json({ error: "Company name and role are required" }, { status: 400 })
    }

    let startDate: Date | null = null
    if (body.startDate) {
      const parsed = new Date(body.startDate)
      if (!isNaN(parsed.getTime())) startDate = parsed
    }

    let endDate: Date | null = null
    if (body.endDate) {
      const parsed = new Date(body.endDate)
      if (!isNaN(parsed.getTime())) endDate = parsed
    }

    const internship = await prisma.internship.create({
      data: {
        studentId,
        company: String(body.company).trim(),
        role: String(body.role).trim(),
        startDate,
        endDate,
        durationWeeks: body.durationWeeks ? parseInt(body.durationWeeks) : null,
        location: body.location || null,
        stipend: body.stipend ? parseFloat(body.stipend) : null,
        internshipType: body.internshipType || "INDUSTRY",
        status: body.status || "COMPLETED",
        certificateUrl: body.certificateUrl || null,
        description: body.description || null,
        addedById: session.user.id,
      },
      include: {
        student: { select: { usn: true, name: true } },
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      module: "internships",
      recordId: internship.id,
      recordDesc: `Added internship for ${(internship as any).student?.usn ?? studentId}: ${internship.company} (${internship.role})`,
    })

    return NextResponse.json(internship, { status: 201 })
  } catch (error: any) {
    console.error("Failed to create internship:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to record internship" },
      { status: 500 }
    )
  }
}
