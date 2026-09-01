import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { createAuditLog } from "@/lib/audit"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const where: Record<string, unknown> = {}
  if (session.user.role !== "SUPER_ADMIN" && session.user.departmentId) {
    where.student = { departmentId: session.user.departmentId }
  }

  const certifications = await prisma.certification.findMany({
    where,
    include: {
      student: { select: { name: true, usn: true, department: { select: { code: true } } } },
      addedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json(certifications)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["SUPER_ADMIN", "HOD", "FACULTY"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()

    let studentId = body.studentId
    if (!studentId && body.usn) {
      const student = await prisma.student.findUnique({
        where: { usn: String(body.usn).trim().toUpperCase() },
        select: { id: true },
      })
      if (!student) {
        return NextResponse.json(
          { error: `Student with USN '${body.usn}' was not found.` },
          { status: 404 }
        )
      }
      studentId = student.id
    }

    if (!studentId) {
      return NextResponse.json({ error: "Student USN or Student ID is required." }, { status: 400 })
    }

    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ error: "Certification name is required." }, { status: 400 })
    }

    let issueDate = new Date()
    if (body.issueDate) {
      const parsed = new Date(body.issueDate)
      if (!isNaN(parsed.getTime())) issueDate = parsed
    }

    let expiryDate: Date | null = null
    if (body.expiryDate) {
      const parsed = new Date(body.expiryDate)
      if (!isNaN(parsed.getTime())) expiryDate = parsed
    }

    const certification = await prisma.certification.create({
      data: {
        studentId,
        name: String(body.name).trim(),
        issuingOrg: body.issuingOrganization || body.issuingOrg || body.organization || "Industry Credential",
        issueDate,
        expiryDate,
        credentialId: body.credentialId || null,
        credentialUrl: body.credentialUrl || body.url || null,
        certificateUrl: body.certificateUrl || null,
        description: body.description || null,
        verificationStatus: session.user.role === "SUPER_ADMIN" || session.user.role === "HOD" ? "VERIFIED" : "PENDING",
        addedById: session.user.id,
      },
      include: {
        student: { select: { usn: true, name: true } },
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      module: "certifications",
      recordId: certification.id,
      recordDesc: `Added certification for ${(certification as any).student?.usn ?? studentId}: ${certification.name}`,
    })

    return NextResponse.json(certification, { status: 201 })
  } catch (error: any) {
    console.error("Failed to create certification:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to create certification record" },
      { status: 500 }
    )
  }
}
