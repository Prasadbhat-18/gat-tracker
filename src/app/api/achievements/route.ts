import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { createAuditLog } from "@/lib/audit"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const where: Record<string, unknown> = {}

  if (!["SUPER_ADMIN"].includes(session.user.role) && session.user.departmentId) {
    where.student = { departmentId: session.user.departmentId }
  }

  const dept = searchParams.get("dept")
  const category = searchParams.get("category")
  const status = searchParams.get("status")

  if (dept) where.student = { ...(where.student as object ?? {}), departmentId: dept }
  if (category) where.category = category
  if (status) where.verificationStatus = status

  const achievements = await prisma.achievement.findMany({
    where,
    include: {
      student: { select: { name: true, usn: true, department: { select: { code: true } } } },
      addedBy: { select: { name: true } },
      verifiedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json(achievements)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["SUPER_ADMIN", "HOD", "FACULTY"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()

    // 1. Resolve Student ID
    let studentId = body.studentId
    if (!studentId && body.usn) {
      const student = await prisma.student.findUnique({
        where: { usn: String(body.usn).trim().toUpperCase() },
        select: { id: true, departmentId: true },
      })
      if (!student) {
        return NextResponse.json(
          { error: `Student with USN '${body.usn}' was not found in the database.` },
          { status: 404 }
        )
      }
      studentId = student.id
    }

    if (!studentId) {
      return NextResponse.json({ error: "Student USN or Student ID is required." }, { status: 400 })
    }

    if (!body.title || !String(body.title).trim()) {
      return NextResponse.json({ error: "Achievement title is required." }, { status: 400 })
    }

    // 2. Parse Date
    let achievementDate = new Date()
    if (body.achievementDate || body.date) {
      const parsed = new Date(body.achievementDate || body.date)
      if (!isNaN(parsed.getTime())) {
        achievementDate = parsed
      }
    }

    // 3. Normalize Category
    const rawCategory = String(body.category || "ACADEMIC").toUpperCase().replace(/\s+/g, "_")
    const validCategories = [
      "HACKATHON", "ACADEMIC", "TECHNICAL", "SPORTS", "CULTURAL",
      "RESEARCH", "PATENT", "PUBLICATION", "LEADERSHIP", "OTHER"
    ]
    const category = validCategories.includes(rawCategory) ? rawCategory : "OTHER"

    // 4. Normalize Level
    const rawLevel = String(body.level || "COLLEGE").toUpperCase().replace(/\s+/g, "_")
    const validLevels = [
      "INTERNATIONAL", "NATIONAL", "STATE", "UNIVERSITY", "INTER_COLLEGE", "COLLEGE", "DEPARTMENT"
    ]
    const level = validLevels.includes(rawLevel) ? rawLevel : "COLLEGE"

    const achievement = await prisma.achievement.create({
      data: {
        studentId,
        title: String(body.title).trim(),
        category: category as any,
        level: level as any,
        organization: body.organizingBody || body.organization || null,
        position: body.awardPosition || body.position || null,
        achievementDate,
        documentUrl: body.certificateUrl || body.certificate || body.documentUrl || null,
        description: body.description || null,
        verificationStatus: session.user.role === "SUPER_ADMIN" || session.user.role === "HOD" ? "VERIFIED" : "PENDING",
        verifiedById: session.user.role === "SUPER_ADMIN" || session.user.role === "HOD" ? session.user.id : null,
        verifiedAt: session.user.role === "SUPER_ADMIN" || session.user.role === "HOD" ? new Date() : null,
        addedById: session.user.id,
      },
      include: {
        student: { select: { usn: true, name: true } },
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      module: "achievements",
      recordId: achievement.id,
      recordDesc: `Added achievement for ${(achievement as any).student?.usn ?? studentId}: ${achievement.title}`,
    })

    return NextResponse.json(achievement, { status: 201 })
  } catch (error: any) {
    console.error("Failed to create achievement:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to create achievement record" },
      { status: 500 }
    )
  }
}
