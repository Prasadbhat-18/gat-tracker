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

  const projects = await prisma.project.findMany({
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

  return NextResponse.json(projects)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const canEdit = ["SUPER_ADMIN", "HOD", "FACULTY"].includes(session.user.role)
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

    if (!body.title) {
      return NextResponse.json({ error: "Project title is required" }, { status: 400 })
    }

    let technologies: string[] = []
    if (Array.isArray(body.technologies)) {
      technologies = body.technologies.map((t: string) => String(t).trim()).filter(Boolean)
    } else if (typeof body.technologies === "string") {
      technologies = body.technologies.split(/[,;|]/).map((t: string) => t.trim()).filter(Boolean)
    }

    let teamMembers: string[] = []
    if (Array.isArray(body.teamMembers)) {
      teamMembers = body.teamMembers.map((m: string) => String(m).trim().toUpperCase()).filter(Boolean)
    } else if (typeof body.teamMembers === "string") {
      teamMembers = body.teamMembers.split(/[,;|]/).map((m: string) => m.trim().toUpperCase()).filter(Boolean)
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

    const validProjectTypes = [
      "FINAL_YEAR",
      "MINI_PROJECT",
      "RESEARCH",
      "OPEN_SOURCE",
      "INTERNSHIP_PROJECT",
      "PERSONAL",
      "OTHER",
    ]
    let projectType: any = "MINI_PROJECT"
    if (body.projectType) {
      const pt = String(body.projectType).trim().toUpperCase()
      if (validProjectTypes.includes(pt)) {
        projectType = pt
      } else if (pt === "CAPSTONE" || pt === "MAJOR_PROJECT") {
        projectType = "FINAL_YEAR"
      } else {
        projectType = "OTHER"
      }
    }

    const project = await prisma.project.create({
      data: {
        studentId,
        title: String(body.title).trim(),
        projectType,
        description: body.description || null,
        technologies,
        teamMembers,
        facultyGuide: body.facultyGuide || null,
        githubUrl: body.githubUrl || null,
        demoUrl: body.demoUrl || null,
        documentUrl: body.documentUrl || body.certificateUrl || null,
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
      module: "projects",
      recordId: project.id,
      recordDesc: `Added project for ${(project as any).student?.usn ?? studentId}: ${project.title}`,
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error: any) {
    console.error("Failed to create project:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to record project" },
      { status: 500 }
    )
  }
}
