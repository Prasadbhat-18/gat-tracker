import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { generateExcelTemplateBuffer, TemplateType } from "@/lib/excel-templates"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = (searchParams.get("type") || "all") as TemplateType

  try {
    const { buffer, filename } = await generateExcelTemplateBuffer(type)

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (err: any) {
    console.error("Template generation error:", err)
    return NextResponse.json({ error: "Failed to generate template", details: err?.message }, { status: 500 })
  }
}
