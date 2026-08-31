import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { createAuditLog } from "@/lib/audit"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const q = searchParams.get("q") ?? ""
  const dept = searchParams.get("dept") ?? ""
  const batch = searchParams.get("batch") ?? ""
  const status = searchParams.get("status") ?? ""
  const isAdmin = session.user.role === "SUPER_ADMIN"

  const where: Record<string, unknown> = {}
  if (!isAdmin && session.user.departmentId) where.departmentId = session.user.departmentId
  if (dept && isAdmin) where.departmentId = dept
  if (batch) where.batchId = batch
  if (status) where.placementStatus = status
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { usn: { contains: q, mode: "insensitive" } },
    ]
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        department: { select: { name: true, code: true } },
        batch: { select: { name: true } },
        _count: { select: { achievements: true, certifications: true, internships: true, placements: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * 20,
      take: 20,
    }),
    prisma.student.count({ where }),
  ])

  return NextResponse.json({ students, total })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["SUPER_ADMIN", "HOD", "FACULTY"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const student = await prisma.student.create({ data: body })

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      module: "students",
      recordId: student.id,
      recordDesc: `Added student ${student.name} (${student.usn})`,
    })

    return NextResponse.json(student, { status: 201 })
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "USN already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
  }
}
