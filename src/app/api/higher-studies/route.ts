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

  const records = await prisma.higherStudy.findMany({
    where,
    include: {
      student: {
        select: {
          name: true,
          usn: true,
          department: { select: { code: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return NextResponse.json(records)
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

    if (!body.institution || !body.program) {
      return NextResponse.json({ error: "Institution and degree program are required" }, { status: 400 })
    }

    const higherStudy = await prisma.higherStudy.create({
      data: {
        studentId,
        institution: String(body.institution).trim(),
        program: String(body.program).trim(),
        specialization: body.specialization || null,
        country: body.country || "India",
        examName: body.examName || null,
        examScore: body.examScore || null,
        admissionYear: body.admissionYear ? parseInt(body.admissionYear) : new Date().getFullYear(),
        scholarshipInfo: body.scholarshipInfo || null,
        remarks: body.remarks || null,
      },
      include: {
        student: { select: { usn: true, name: true } },
      },
    })

    // Update student career outcome
    await prisma.student.update({
      where: { id: studentId },
      data: { careerOutcome: "HIGHER_STUDIES" },
    })

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      module: "higher-studies",
      recordId: higherStudy.id,
      recordDesc: `Added higher studies record for ${(higherStudy as any).student?.usn ?? studentId}: ${higherStudy.program} at ${higherStudy.institution}`,
    })

    return NextResponse.json(higherStudy, { status: 201 })
  } catch (error: any) {
    console.error("Failed to record higher studies:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to record higher studies" },
      { status: 500 }
    )
  }
}
