import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { executeExcelImport } from "@/lib/excel-import"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!["SUPER_ADMIN", "HOD", "FACULTY", "PLACEMENT_OFFICER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await executeExcelImport(
      buffer,
      session.user.id,
      session.user.departmentId,
      session.user.role
    )

    return NextResponse.json(result)
  } catch (err: any) {
    console.error("Excel import execution error:", err)
    return NextResponse.json(
      { error: "Failed to execute bulk import", details: err?.message || String(err) },
      { status: 500 }
    )
  }
}
