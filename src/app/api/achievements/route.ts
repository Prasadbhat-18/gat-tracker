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
    const achievement = await prisma.achievement.create({
      data: { ...body, addedById: session.user.id },
    })

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      module: "achievements",
      recordId: achievement.id,
      recordDesc: `Added achievement: ${achievement.title}`,
    })

    return NextResponse.json(achievement, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create achievement" }, { status: 500 })
  }
}
