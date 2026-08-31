import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") ?? "students"
  const dept = searchParams.get("dept") ?? ""
  const batch = searchParams.get("batch") ?? ""

  const isAdmin = session.user.role === "SUPER_ADMIN"
  const deptFilter = !isAdmin && session.user.departmentId ? { departmentId: session.user.departmentId } : {}
  if (dept && isAdmin) Object.assign(deptFilter, { departmentId: dept })

  try {
    // Dynamic import to avoid bundling issues
    const ExcelJS = (await import("exceljs")).default
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "GAT Tracker"
    workbook.created = new Date()

    const headerStyle = {
      font: { bold: true, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FF1D4ED8" } },
      alignment: { horizontal: "center" as const },
    }

    if (type === "students" || type === "all") {
      const students = await prisma.student.findMany({
        where: { ...deptFilter, ...(batch ? { batchId: batch } : {}) },
        include: {
          department: { select: { name: true, code: true } },
          batch: { select: { name: true } },
          _count: { select: { achievements: true, certifications: true, internships: true, placements: true } },
        },
        orderBy: [{ department: { code: "asc" } }, { usn: "asc" }],
      })

      const ws = workbook.addWorksheet("Students")
      ws.columns = [
        { header: "USN", key: "usn", width: 15 },
        { header: "Name", key: "name", width: 25 },
        { header: "Department", key: "dept", width: 15 },
        { header: "Batch", key: "batch", width: 12 },
        { header: "Year", key: "year", width: 8 },
        { header: "CGPA", key: "cgpa", width: 8 },
        { header: "Status", key: "status", width: 12 },
        { header: "Placement Status", key: "placement", width: 18 },
        { header: "Achievements", key: "ach", width: 12 },
        { header: "Certifications", key: "cert", width: 14 },
        { header: "Internships", key: "intern", width: 12 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone", key: "phone", width: 15 },
        { header: "Section", key: "section", width: 10 },
      ]

      ws.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle))

      students.forEach((s) => {
        ws.addRow({
          usn: s.usn,
          name: s.name,
          dept: s.department.code,
          batch: s.batch.name,
          year: s.currentYear,
          cgpa: s.cgpa,
          status: s.status,
          placement: s.placementStatus,
          ach: s._count.achievements,
          cert: s._count.certifications,
          intern: s._count.internships,
          email: s.email ?? "",
          phone: s.phone ?? "",
          section: s.section ?? "",
        })
      })
    }

    if (type === "placements" || type === "all") {
      const placements = await prisma.placement.findMany({
        where: { student: deptFilter },
        include: {
          student: { select: { name: true, usn: true, department: { select: { code: true } }, batch: { select: { name: true } } } },
          company: { select: { name: true } },
          drive: { select: { driveName: true } },
        },
        orderBy: { offerDate: "desc" },
      })

      const ws = workbook.addWorksheet("Placements")
      ws.columns = [
        { header: "USN", key: "usn", width: 15 },
        { header: "Name", key: "name", width: 25 },
        { header: "Dept", key: "dept", width: 10 },
        { header: "Batch", key: "batch", width: 12 },
        { header: "Company", key: "company", width: 20 },
        { header: "Job Role", key: "role", width: 25 },
        { header: "CTC (LPA)", key: "ctc", width: 12 },
        { header: "Location", key: "location", width: 15 },
        { header: "Offer Date", key: "offerDate", width: 14 },
        { header: "Joining Date", key: "joiningDate", width: 14 },
        { header: "Offer Status", key: "status", width: 18 },
        { header: "Final Accepted", key: "final", width: 14 },
        { header: "Drive", key: "drive", width: 25 },
      ]

      ws.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle))

      placements.forEach((p) => {
        ws.addRow({
          usn: p.student.usn,
          name: p.student.name,
          dept: p.student.department.code,
          batch: p.student.batch.name,
          company: p.company.name,
          role: p.jobRole,
          ctc: p.ctc,
          location: p.location ?? "",
          offerDate: p.offerDate ? new Date(p.offerDate).toLocaleDateString("en-IN") : "",
          joiningDate: p.joiningDate ? new Date(p.joiningDate).toLocaleDateString("en-IN") : "",
          status: p.offerStatus,
          final: p.isFinalAccepted ? "Yes" : "No",
          drive: p.drive?.driveName ?? "",
        })
      })
    }

    if (type === "achievements" || type === "all") {
      const achievements = await prisma.achievement.findMany({
        where: { student: deptFilter },
        include: {
          student: { select: { name: true, usn: true, department: { select: { code: true } } } },
        },
        orderBy: { achievementDate: "desc" },
      })

      const ws = workbook.addWorksheet("Achievements")
      ws.columns = [
        { header: "USN", key: "usn", width: 15 },
        { header: "Name", key: "name", width: 25 },
        { header: "Dept", key: "dept", width: 10 },
        { header: "Achievement", key: "title", width: 40 },
        { header: "Category", key: "category", width: 20 },
        { header: "Level", key: "level", width: 15 },
        { header: "Organization", key: "org", width: 30 },
        { header: "Position", key: "position", width: 20 },
        { header: "Date", key: "date", width: 14 },
        { header: "Status", key: "status", width: 12 },
      ]

      ws.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle))

      achievements.forEach((a) => {
        ws.addRow({
          usn: a.student.usn,
          name: a.student.name,
          dept: a.student.department.code,
          title: a.title,
          category: a.category.replace(/_/g, " "),
          level: a.level?.replace(/_/g, " ") ?? "",
          org: a.organization ?? "",
          position: a.position ?? "",
          date: a.achievementDate ? new Date(a.achievementDate).toLocaleDateString("en-IN") : "",
          status: a.verificationStatus,
        })
      })
    }

    const buffer = await workbook.xlsx.writeBuffer()

    const deptCode = dept ? `_${dept}` : ""
    const batchCode = batch ? `_${batch}` : ""
    const filename = `GAT${deptCode}${batchCode}_${type}_Report_${new Date().toISOString().slice(0, 10)}.xlsx`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (e) {
    console.error("Export error:", e)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
