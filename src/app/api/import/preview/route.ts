import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { previewExcelData } from "@/lib/excel-import"

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

    const preview = await previewExcelData(
      buffer,
      session.user.departmentId,
      session.user.role
    )

    return NextResponse.json(preview)
  } catch (err: any) {
    console.error("Excel preview error:", err)
    return NextResponse.json(
      { error: "Failed to parse spreadsheet", details: err?.message || String(err) },
      { status: 500 }
    )
  }
}
