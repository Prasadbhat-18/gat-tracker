import * as XLSX from "xlsx"
import { prisma } from "@/lib/db"
import {
  AchievementCategory,
  AchievementLevel,
  InternshipType,
  InternshipStatus,
  ProjectType,
  PlacementStatus,
  StudentStatus,
  AuditAction,
} from "@prisma/client"
import { createAuditLog } from "@/lib/audit"

export interface ValidationError {
  sheet: string
  row: number
  field?: string
  message: string
  severity: "error" | "warning"
}

export interface ParsedStudentRow {
  usn: string
  name: string
  departmentCode: string
  batchName: string
  currentYear?: number
  section?: string
  email?: string
  phone?: string
  gender?: string
  dateOfBirth?: Date | null
  cgpa?: number | null
  backlogs?: number
  placementStatus?: PlacementStatus
  status?: StudentStatus
  action?: "create" | "update"
}

export interface ParsedAchievementRow {
  usn: string
  title: string
  category: AchievementCategory
  level?: AchievementLevel | null
  organization?: string
  position?: string
  date?: Date | null
  description?: string
}

export interface ParsedCertificationRow {
  usn: string
  name: string
  issuingOrg: string
  issueDate?: Date | null
  expiryDate?: Date | null
  credentialId?: string
  credentialUrl?: string
  description?: string
}

export interface ParsedInternshipRow {
  usn: string
  company: string
  role: string
  startDate?: Date | null
  endDate?: Date | null
  durationWeeks?: number | null
  location?: string
  stipend?: number | null
  internshipType: InternshipType
  status: InternshipStatus
  description?: string
}

export interface ParsedProjectRow {
  usn: string
  title: string
  projectType: ProjectType
  technologies: string[]
  facultyGuide?: string
  teamMembers: string[]
  startDate?: Date | null
  endDate?: Date | null
  githubUrl?: string
  demoUrl?: string
  description?: string
}

export interface ImportPreviewResult {
  sheetNames: string[]
  totalRows: number
  validRows: number
  errorCount: number
  warningCount: number
  errors: ValidationError[]
  students: {
    total: number
    toCreate: number
    toUpdate: number
    preview: ParsedStudentRow[]
  }
  achievements: {
    total: number
    preview: ParsedAchievementRow[]
  }
  certifications: {
    total: number
    preview: ParsedCertificationRow[]
  }
  internships: {
    total: number
    preview: ParsedInternshipRow[]
  }
  projects: {
    total: number
    preview: ParsedProjectRow[]
  }
}

export interface ImportExecutionResult {
  success: boolean
  summary: {
    studentsCreated: number
    studentsUpdated: number
    achievementsCreated: number
    certificationsCreated: number
    internshipsCreated: number
    projectsCreated: number
    failedCount: number
  }
  errors: ValidationError[]
}

// ─────────────────────────────────────────────
// Normalization & Helpers
// ─────────────────────────────────────────────

export function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/\*/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim()
}

export function parseDateValue(val: unknown): Date | null {
  if (!val) return null
  if (val instanceof Date && !isNaN(val.getTime())) return val

  if (typeof val === "number") {
    // Excel serial number
    const parsed = XLSX.SSF.parse_date_code(val)
    if (parsed) {
      return new Date(parsed.y, parsed.m - 1, parsed.d)
    }
  }

  if (typeof val === "string") {
    const trimmed = val.trim()
    if (!trimmed || trimmed.startsWith("[")) return null

    // Try YYYY-MM-DD
    const isoMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
    if (isoMatch) {
      const [, y, m, d] = isoMatch
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
    }

    // Try DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/)
    if (dmyMatch) {
      const [, d, m, y] = dmyMatch
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
    }

    const d = new Date(trimmed)
    if (!isNaN(d.getTime())) return d
  }

  return null
}

export function parseNumberValue(val: unknown, fallback?: number): number | undefined {
  if (val === undefined || val === null || val === "") return fallback
  const num = parseFloat(String(val).replace(/[^0-9.-]/g, ""))
  return isNaN(num) ? fallback : num
}

export function parseAchievementCategory(val: unknown): AchievementCategory {
  if (!val) return AchievementCategory.OTHER
  const s = String(val).toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z_]/g, "")

  if (s.includes("HACKATHON")) return AchievementCategory.HACKATHON
  if (s.includes("CODING") || s.includes("PROGRAMMING")) return AchievementCategory.CODING_COMPETITION
  if (s.includes("ACADEMIC") || s.includes("RANK") || s.includes("TOPPER")) return AchievementCategory.ACADEMIC
  if (s.includes("RESEARCH")) return AchievementCategory.RESEARCH
  if (s.includes("PUBLICATION") || s.includes("JOURNAL")) return AchievementCategory.PUBLICATION
  if (s.includes("PAPER") || s.includes("CONFERENCE")) return AchievementCategory.PAPER_PRESENTATION
  if (s.includes("PATENT")) return AchievementCategory.PATENT
  if (s.includes("SPORT") || s.includes("ATHLETIC") || s.includes("CRICKET") || s.includes("BADMINTON")) return AchievementCategory.SPORTS
  if (s.includes("CULTUR") || s.includes("DANCE") || s.includes("MUSIC") || s.includes("DRAMA")) return AchievementCategory.CULTURAL
  if (s.includes("LEAD") || s.includes("PRESIDENT") || s.includes("SECRETARY")) return AchievementCategory.LEADERSHIP
  if (s.includes("SOCIAL") || s.includes("NSS") || s.includes("ROTARACT") || s.includes("NGO")) return AchievementCategory.SOCIAL_SERVICE
  if (s.includes("CERTIF")) return AchievementCategory.CERTIFICATION
  if (s.includes("TECH")) return AchievementCategory.TECHNICAL

  const valid = Object.values(AchievementCategory)
  return valid.includes(s as AchievementCategory) ? (s as AchievementCategory) : AchievementCategory.OTHER
}

export function parseAchievementLevel(val: unknown): AchievementLevel | null {
  if (!val) return null
  const s = String(val).toUpperCase().replace(/\s+/g, "_")
  if (s.includes("INTER")) return AchievementLevel.INTERNATIONAL
  if (s.includes("NAT")) return AchievementLevel.NATIONAL
  if (s.includes("STATE")) return AchievementLevel.STATE
  if (s.includes("UNIV")) return AchievementLevel.UNIVERSITY
  if (s.includes("COLL") || s.includes("INSTITUT")) return AchievementLevel.COLLEGE
  if (s.includes("DEPT") || s.includes("DEPARTMENT")) return AchievementLevel.DEPARTMENT
  return null
}

export function parseInternshipType(val: unknown): InternshipType {
  if (!val) return InternshipType.INDUSTRY
  const s = String(val).toUpperCase()
  if (s.includes("RESEARCH")) return InternshipType.RESEARCH
  if (s.includes("STARTUP")) return InternshipType.STARTUP
  if (s.includes("NGO")) return InternshipType.NGO
  if (s.includes("GOV")) return InternshipType.GOVERNMENT
  return InternshipType.INDUSTRY
}

export function parseInternshipStatus(val: unknown): InternshipStatus {
  if (!val) return InternshipStatus.COMPLETED
  const s = String(val).toUpperCase()
  if (s.includes("ONGO") || s.includes("PURSU")) return InternshipStatus.ONGOING
  if (s.includes("DISCONT") || s.includes("DROPP")) return InternshipStatus.DISCONTINUED
  return InternshipStatus.COMPLETED
}

export function parseProjectType(val: unknown): ProjectType {
  if (!val) return ProjectType.MINI_PROJECT
  const s = String(val).toUpperCase().replace(/\s+/g, "_")
  if (s.includes("FINAL") || s.includes("CAPSTONE") || s.includes("MAJOR")) return ProjectType.FINAL_YEAR
  if (s.includes("MINI")) return ProjectType.MINI_PROJECT
  if (s.includes("RESEARCH")) return ProjectType.RESEARCH
  if (s.includes("OPEN") || s.includes("SOURCE")) return ProjectType.OPEN_SOURCE
  if (s.includes("INTERN")) return ProjectType.INTERNSHIP_PROJECT
  if (s.includes("PERSON") || s.includes("HOBBY")) return ProjectType.PERSONAL
  return ProjectType.MINI_PROJECT
}

export function parsePlacementStatus(val: unknown): PlacementStatus {
  if (!val) return PlacementStatus.ELIGIBLE
  const s = String(val).toUpperCase().replace(/\s+/g, "_")
  if (s.includes("PLACED")) return PlacementStatus.PLACED
  if (s.includes("NOT_PLACED") || s.includes("UNPLACED")) return PlacementStatus.NOT_PLACED
  if (s.includes("HIGHER")) return PlacementStatus.HIGHER_STUDIES
  if (s.includes("OPT") || s.includes("OUT")) return PlacementStatus.OPTED_OUT
  if (s.includes("APPL")) return PlacementStatus.APPLIED
  if (s.includes("SHORT")) return PlacementStatus.SHORTLISTED
  if (s.includes("SELECT")) return PlacementStatus.SELECTED
  return PlacementStatus.ELIGIBLE
}

// ─────────────────────────────────────────────
// Raw Excel Reader
// ─────────────────────────────────────────────

export function readExcelRows(buffer: ArrayBuffer | Buffer): Record<string, any[][]> {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })
  const result: Record<string, any[][]> = {}

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" })
    if (rows && rows.length > 0) {
      result[sheetName] = rows
    }
  }

  return result
}

// ─────────────────────────────────────────────
// Validation & Preview Generator
// ─────────────────────────────────────────────

export async function previewExcelData(
  buffer: ArrayBuffer | Buffer,
  userDeptId?: string,
  userRole?: string
): Promise<ImportPreviewResult> {
  const sheets = readExcelRows(buffer)
  const sheetNames = Object.keys(sheets)

  const errors: ValidationError[] = []

  // Pre-load reference departments & batches
  const [departments, batches, existingStudents] = await Promise.all([
    prisma.department.findMany({ select: { id: true, name: true, code: true } }),
    prisma.academicBatch.findMany({ select: { id: true, name: true, admissionYear: true } }),
    prisma.student.findMany({ select: { usn: true, id: true, departmentId: true } }),
  ])

  const deptMapByCode = new Map(departments.map((d) => [d.code.toUpperCase(), d]))
  const deptMapByName = new Map(departments.map((d) => [d.name.toUpperCase(), d]))
  const batchMapByName = new Map(batches.map((b) => [b.name.toUpperCase(), b]))
  const existingStudentUsns = new Set(existingStudents.map((s) => s.usn.toUpperCase()))

  const parsedStudents: ParsedStudentRow[] = []
  const parsedAchievements: ParsedAchievementRow[] = []
  const parsedCertifications: ParsedCertificationRow[] = []
  const parsedInternships: ParsedInternshipRow[] = []
  const parsedProjects: ParsedProjectRow[] = []

  // Newly parsed USNs across this upload
  const parsedStudentUsns = new Set<string>()

  // Process sheets
  for (const [rawSheetName, rows] of Object.entries(sheets)) {
    if (!rows || rows.length < 2) continue

    const headerRow = rows[0] as string[]
    const normalizedHeaders = headerRow.map((h) => normalizeKey(String(h ?? "")))

    // Helper to find column index
    const colIdx = (...keys: string[]): number => {
      for (const k of keys) {
        const idx = normalizedHeaders.findIndex((h) => h.includes(k))
        if (idx !== -1) return idx
      }
      return -1
    }

    const sNameUpper = rawSheetName.toUpperCase()

    // Determine Sheet Category
    const isStudentsSheet =
      sNameUpper.includes("STUDENT") ||
      (colIdx("usn") !== -1 && (colIdx("cgpa") !== -1 || colIdx("department") !== -1 || colIdx("dept") !== -1))

    const isAchievementsSheet =
      sNameUpper.includes("ACHIEVEMENT") ||
      sNameUpper.includes("ACTIVIT") ||
      (colIdx("category") !== -1 && (colIdx("position") !== -1 || colIdx("award") !== -1 || colIdx("title") !== -1))

    const isCertificationsSheet =
      sNameUpper.includes("CERTIF") ||
      (colIdx("cert") !== -1 && colIdx("issuing") !== -1)

    const isInternshipsSheet =
      sNameUpper.includes("INTERN") ||
      (colIdx("stipend") !== -1 || (colIdx("company") !== -1 && colIdx("role") !== -1))

    const isProjectsSheet =
      sNameUpper.includes("PROJECT") ||
      (colIdx("technolog") !== -1 || colIdx("github") !== -1)

    // Parse Rows
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r]
      if (!row || row.every((c) => c === "" || c === null || c === undefined)) continue

      const firstCell = String(row[0] ?? "").trim()
      if (firstCell.startsWith("[") || firstCell.toLowerCase().includes("instruction") || firstCell.toLowerCase().includes("example")) {
        continue // Skip instruction row
      }

      const getVal = (idx: number): any => (idx >= 0 && idx < row.length ? row[idx] : undefined)

      // ── STUDENTS PARSER ──
      if (isStudentsSheet) {
        const usnIdx = colIdx("usn", "seatno", "rollno")
        const nameIdx = colIdx("name", "fullname", "studentname")
        const deptIdx = colIdx("departmentcode", "deptcode", "department", "dept", "branch")
        const batchIdx = colIdx("batchname", "batch", "academicbatch", "batchyear")
        const yearIdx = colIdx("currentyear", "year")
        const secIdx = colIdx("section", "sec")
        const emailIdx = colIdx("email", "emailid")
        const phoneIdx = colIdx("phone", "mobile", "contact")
        const genderIdx = colIdx("gender", "sex")
        const dobIdx = colIdx("dateofbirth", "dob", "birthdate")
        const cgpaIdx = colIdx("cgpa", "gpa")
        const backlogsIdx = colIdx("backlogs", "backlog", "arrears")
        const placementIdx = colIdx("placementstatus", "placement", "placedstatus")

        const usnRaw = String(getVal(usnIdx) ?? "").trim().toUpperCase()
        const nameRaw = String(getVal(nameIdx) ?? "").trim()
        const deptRaw = String(getVal(deptIdx) ?? "").trim().toUpperCase()
        const batchRaw = String(getVal(batchIdx) ?? "").trim().toUpperCase()

        if (!usnRaw) {
          errors.push({
            sheet: rawSheetName,
            row: r + 1,
            field: "USN",
            message: "Row is missing a Student USN",
            severity: "error",
          })
          continue
        }

        if (!nameRaw) {
          errors.push({
            sheet: rawSheetName,
            row: r + 1,
            field: "Name",
            message: `Student with USN ${usnRaw} is missing a Name`,
            severity: "error",
          })
          continue
        }

        // Match department
        let matchedDept = deptMapByCode.get(deptRaw) || deptMapByName.get(deptRaw)
        if (!matchedDept && userDeptId && userRole === "FACULTY") {
          matchedDept = departments.find((d) => d.id === userDeptId)
        }

        if (!matchedDept && deptRaw) {
          errors.push({
            sheet: rawSheetName,
            row: r + 1,
            field: "Department",
            message: `Unknown Department '${deptRaw}'. Available: ${departments.map((d) => d.code).join(", ")}`,
            severity: "warning",
          })
        }

        const isUpdate = existingStudentUsns.has(usnRaw)
        parsedStudentUsns.add(usnRaw)

        const studentRow: ParsedStudentRow = {
          usn: usnRaw,
          name: nameRaw,
          departmentCode: matchedDept?.code ?? deptRaw,
          batchName: batchRaw || "2023-2027",
          currentYear: parseNumberValue(getVal(yearIdx), 1),
          section: getVal(secIdx) ? String(getVal(secIdx)).trim().toUpperCase() : undefined,
          email: getVal(emailIdx) ? String(getVal(emailIdx)).trim().toLowerCase() : `${usnRaw.toLowerCase()}@student.gat.edu.in`,
          phone: getVal(phoneIdx) ? String(getVal(phoneIdx)).trim() : undefined,
          gender: getVal(genderIdx) ? String(getVal(genderIdx)).trim() : undefined,
          dateOfBirth: parseDateValue(getVal(dobIdx)),
          cgpa: parseNumberValue(getVal(cgpaIdx)),
          backlogs: parseNumberValue(getVal(backlogsIdx), 0),
          placementStatus: parsePlacementStatus(getVal(placementIdx)),
          action: isUpdate ? "update" : "create",
        }

        parsedStudents.push(studentRow)
      }

      // ── ACHIEVEMENTS PARSER ──
      else if (isAchievementsSheet) {
        const usnIdx = colIdx("studentusn", "usn")
        const titleIdx = colIdx("achievementtitle", "title", "achievement", "activity", "event")
        const catIdx = colIdx("category", "activitytype", "type")
        const levelIdx = colIdx("level", "achievementlevel")
        const orgIdx = colIdx("organizingbody", "organization", "organizer", "org", "body")
        const posIdx = colIdx("position", "award", "rank", "prize")
        const dateIdx = colIdx("date", "achievementdate", "eventdate")
        const descIdx = colIdx("description", "remarks", "details", "summary")

        const usn = String(getVal(usnIdx) ?? "").trim().toUpperCase()
        const title = String(getVal(titleIdx) ?? "").trim()

        if (!usn) {
          errors.push({
            sheet: rawSheetName,
            row: r + 1,
            field: "USN",
            message: "Missing Student USN for achievement",
            severity: "error",
          })
          continue
        }

        if (!title) {
          errors.push({
            sheet: rawSheetName,
            row: r + 1,
            field: "Title",
            message: `Missing Achievement Title for student ${usn}`,
            severity: "error",
          })
          continue
        }

        if (!existingStudentUsns.has(usn) && !parsedStudentUsns.has(usn)) {
          errors.push({
            sheet: rawSheetName,
            row: r + 1,
            field: "USN",
            message: `Student USN '${usn}' not found in database or Students sheet. Add the student first or include them in the Students tab.`,
            severity: "warning",
          })
        }

        parsedAchievements.push({
          usn,
          title,
          category: parseAchievementCategory(getVal(catIdx)),
          level: parseAchievementLevel(getVal(levelIdx)),
          organization: getVal(orgIdx) ? String(getVal(orgIdx)).trim() : undefined,
          position: getVal(posIdx) ? String(getVal(posIdx)).trim() : undefined,
          date: parseDateValue(getVal(dateIdx)),
          description: getVal(descIdx) ? String(getVal(descIdx)).trim() : undefined,
        })
      }

      // ── CERTIFICATIONS PARSER ──
      else if (isCertificationsSheet) {
        const usnIdx = colIdx("studentusn", "usn")
        const nameIdx = colIdx("certificationname", "name", "title", "course")
        const orgIdx = colIdx("issuingorganization", "organization", "issuingorg", "org", "platform")
        const issueDateIdx = colIdx("issuedate", "date", "issued")
        const expiryDateIdx = colIdx("expirydate", "validtill", "expiry")
        const credIdIdx = colIdx("credentialid", "certificateid", "id")
        const urlIdx = colIdx("verificationurl", "credentialurl", "url", "link")
        const descIdx = colIdx("description", "remarks")

        const usn = String(getVal(usnIdx) ?? "").trim().toUpperCase()
        const name = String(getVal(nameIdx) ?? "").trim()
        const issuingOrg = String(getVal(orgIdx) ?? "").trim()

        if (!usn || !name) {
          errors.push({
            sheet: rawSheetName,
            row: r + 1,
            message: `Certification row missing required USN or Name (${usn || "No USN"}, ${name || "No Name"})`,
            severity: "error",
          })
          continue
        }

        if (!existingStudentUsns.has(usn) && !parsedStudentUsns.has(usn)) {
          errors.push({
            sheet: rawSheetName,
            row: r + 1,
            field: "USN",
            message: `Student USN '${usn}' not found in database or Students sheet`,
            severity: "warning",
          })
        }

        parsedCertifications.push({
          usn,
          name,
          issuingOrg: issuingOrg || "Online / Academy",
          issueDate: parseDateValue(getVal(issueDateIdx)),
          expiryDate: parseDateValue(getVal(expiryDateIdx)),
          credentialId: getVal(credIdIdx) ? String(getVal(credIdIdx)).trim() : undefined,
          credentialUrl: getVal(urlIdx) ? String(getVal(urlIdx)).trim() : undefined,
          description: getVal(descIdx) ? String(getVal(descIdx)).trim() : undefined,
        })
      }

      // ── INTERNSHIPS PARSER ──
      else if (isInternshipsSheet) {
        const usnIdx = colIdx("studentusn", "usn")
        const compIdx = colIdx("companyname", "company", "organization", "firm")
        const roleIdx = colIdx("roledomain", "role", "designation", "domain", "profile")
        const startIdx = colIdx("startdate", "from", "start")
        const endIdx = colIdx("enddate", "to", "end")
        const weeksIdx = colIdx("durationweeks", "duration", "weeks")
        const locIdx = colIdx("location", "city")
        const stipendIdx = colIdx("monthlystipend", "stipend", "salary")
        const typeIdx = colIdx("internshiptype", "type")
        const statusIdx = colIdx("status")
        const descIdx = colIdx("description", "deliverables", "summary")

        const usn = String(getVal(usnIdx) ?? "").trim().toUpperCase()
        const company = String(getVal(compIdx) ?? "").trim()
        const role = String(getVal(roleIdx) ?? "").trim()

        if (!usn || !company) {
          errors.push({
            sheet: rawSheetName,
            row: r + 1,
            message: `Internship row missing required USN or Company (${usn || "No USN"}, ${company || "No Company"})`,
            severity: "error",
          })
          continue
        }

        if (!existingStudentUsns.has(usn) && !parsedStudentUsns.has(usn)) {
          errors.push({
            sheet: rawSheetName,
            row: r + 1,
            field: "USN",
            message: `Student USN '${usn}' not found in database or Students sheet`,
            severity: "warning",
          })
        }

        parsedInternships.push({
          usn,
          company,
          role: role || "Intern",
          startDate: parseDateValue(getVal(startIdx)),
          endDate: parseDateValue(getVal(endIdx)),
          durationWeeks: parseNumberValue(getVal(weeksIdx)),
          location: getVal(locIdx) ? String(getVal(locIdx)).trim() : undefined,
          stipend: parseNumberValue(getVal(stipendIdx)),
          internshipType: parseInternshipType(getVal(typeIdx)),
          status: parseInternshipStatus(getVal(statusIdx)),
          description: getVal(descIdx) ? String(getVal(descIdx)).trim() : undefined,
        })
      }

      // ── PROJECTS PARSER ──
      else if (isProjectsSheet) {
        const usnIdx = colIdx("studentusn", "usn")
        const titleIdx = colIdx("projecttitle", "title", "projectname", "project")
        const typeIdx = colIdx("projecttype", "type")
        const techIdx = colIdx("technologies", "techstack", "stack", "tech")
        const guideIdx = colIdx("facultyguide", "guide", "mentor", "advisor")
        const teamIdx = colIdx("teammembers", "team", "members")
        const ghIdx = colIdx("githuburl", "github", "repo")
        const demoIdx = colIdx("livedemourl", "demourl", "demo", "url")
        const descIdx = colIdx("description", "summary", "abstract")

        const usn = String(getVal(usnIdx) ?? "").trim().toUpperCase()
        const title = String(getVal(titleIdx) ?? "").trim()

        if (!usn || !title) {
          errors.push({
            sheet: rawSheetName,
            row: r + 1,
            message: `Project row missing required USN or Project Title (${usn || "No USN"}, ${title || "No Title"})`,
            severity: "error",
          })
          continue
        }

        if (!existingStudentUsns.has(usn) && !parsedStudentUsns.has(usn)) {
          errors.push({
            sheet: rawSheetName,
            row: r + 1,
            field: "USN",
            message: `Student USN '${usn}' not found in database or Students sheet`,
            severity: "warning",
          })
        }

        const techRaw = getVal(techIdx) ? String(getVal(techIdx)) : ""
        const techs = techRaw
          .split(/[,;|]/)
          .map((t) => t.trim())
          .filter(Boolean)

        const teamRaw = getVal(teamIdx) ? String(getVal(teamIdx)) : ""
        const teamMembers = teamRaw
          .split(/[,;|]/)
          .map((t) => t.trim().toUpperCase())
          .filter(Boolean)

        parsedProjects.push({
          usn,
          title,
          projectType: parseProjectType(getVal(typeIdx)),
          technologies: techs,
          facultyGuide: getVal(guideIdx) ? String(getVal(guideIdx)).trim() : undefined,
          teamMembers,
          githubUrl: getVal(ghIdx) ? String(getVal(ghIdx)).trim() : undefined,
          demoUrl: getVal(demoIdx) ? String(getVal(demoIdx)).trim() : undefined,
          description: getVal(descIdx) ? String(getVal(descIdx)).trim() : undefined,
        })
      }
    }
  }

  const errorCount = errors.filter((e) => e.severity === "error").length
  const warningCount = errors.filter((e) => e.severity === "warning").length
  const totalRows =
    parsedStudents.length +
    parsedAchievements.length +
    parsedCertifications.length +
    parsedInternships.length +
    parsedProjects.length

  return {
    sheetNames,
    totalRows,
    validRows: totalRows,
    errorCount,
    warningCount,
    errors,
    students: {
      total: parsedStudents.length,
      toCreate: parsedStudents.filter((s) => s.action === "create").length,
      toUpdate: parsedStudents.filter((s) => s.action === "update").length,
      preview: parsedStudents.slice(0, 15),
    },
    achievements: {
      total: parsedAchievements.length,
      preview: parsedAchievements.slice(0, 15),
    },
    certifications: {
      total: parsedCertifications.length,
      preview: parsedCertifications.slice(0, 15),
    },
    internships: {
      total: parsedInternships.length,
      preview: parsedInternships.slice(0, 15),
    },
    projects: {
      total: parsedProjects.length,
      preview: parsedProjects.slice(0, 15),
    },
  }
}

// ─────────────────────────────────────────────
// Database Import Executor
// ─────────────────────────────────────────────

export async function executeExcelImport(
  buffer: ArrayBuffer | Buffer,
  userId: string,
  userDeptId?: string,
  userRole?: string
): Promise<ImportExecutionResult> {
  const preview = await previewExcelData(buffer, userDeptId, userRole)
  const sheets = readExcelRows(buffer)

  const [departments, batches] = await Promise.all([
    prisma.department.findMany(),
    prisma.academicBatch.findMany(),
  ])

  const deptMapByCode = new Map(departments.map((d) => [d.code.toUpperCase(), d]))
  const deptMapByName = new Map(departments.map((d) => [d.name.toUpperCase(), d]))
  const batchMapByName = new Map(batches.map((b) => [b.name.toUpperCase(), b]))

  // Helper to ensure department & batch exist
  async function resolveDept(codeOrName: string): Promise<string> {
    const matched =
      deptMapByCode.get(codeOrName.toUpperCase()) || deptMapByName.get(codeOrName.toUpperCase())
    if (matched) return matched.id

    if (userDeptId) return userDeptId

    // Default to first department or create CSE
    if (departments.length > 0) return departments[0].id

    const newDept = await prisma.department.create({
      data: { name: "Computer Science & Engineering", code: "CSE" },
    })
    departments.push(newDept)
    deptMapByCode.set("CSE", newDept)
    return newDept.id
  }

  async function resolveBatch(name: string, admissionYear?: number): Promise<string> {
    const cleanName = name || "2023-2027"
    const matched = batchMapByName.get(cleanName.toUpperCase())
    if (matched) return matched.id

    const admYear = admissionYear || parseInt(cleanName.split("-")[0]) || 2023
    const newBatch = await prisma.academicBatch.create({
      data: {
        name: cleanName,
        admissionYear: admYear,
        expectedGraduationYear: admYear + 4,
      },
    })
    batches.push(newBatch)
    batchMapByName.set(cleanName.toUpperCase(), newBatch)
    return newBatch.id
  }

  let studentsCreated = 0
  let studentsUpdated = 0
  let achievementsCreated = 0
  let certificationsCreated = 0
  let internshipsCreated = 0
  let projectsCreated = 0
  let failedCount = 0

  // 1. Process All Students
  const usnToStudentIdMap = new Map<string, string>()

  // Cache existing
  const currentStudents = await prisma.student.findMany({ select: { id: true, usn: true } })
  for (const s of currentStudents) {
    usnToStudentIdMap.set(s.usn.toUpperCase(), s.id)
  }

  for (const [rawSheetName, rows] of Object.entries(sheets)) {
    if (!rows || rows.length < 2) continue
    const headerRow = rows[0] as string[]
    const normalizedHeaders = headerRow.map((h) => normalizeKey(String(h ?? "")))

    const colIdx = (...keys: string[]): number => {
      for (const k of keys) {
        const idx = normalizedHeaders.findIndex((h) => h.includes(k))
        if (idx !== -1) return idx
      }
      return -1
    }

    const sNameUpper = rawSheetName.toUpperCase()
    const isStudentsSheet =
      sNameUpper.includes("STUDENT") ||
      (colIdx("usn") !== -1 && (colIdx("cgpa") !== -1 || colIdx("department") !== -1 || colIdx("dept") !== -1))

    if (!isStudentsSheet) continue

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r]
      if (!row || row.every((c) => c === "" || c === null || c === undefined)) continue
      const firstCell = String(row[0] ?? "").trim()
      if (firstCell.startsWith("[")) continue

      const getVal = (idx: number): any => (idx >= 0 && idx < row.length ? row[idx] : undefined)

      const usnRaw = String(getVal(colIdx("usn", "seatno", "rollno")) ?? "").trim().toUpperCase()
      const nameRaw = String(getVal(colIdx("name", "fullname", "studentname")) ?? "").trim()
      const deptRaw = String(getVal(colIdx("departmentcode", "deptcode", "department", "dept")) ?? "").trim()
      const batchRaw = String(getVal(colIdx("batchname", "batch", "academicbatch")) ?? "").trim()

      if (!usnRaw || !nameRaw) {
        failedCount++
        continue
      }

      try {
        const deptId = await resolveDept(deptRaw)
        const batchId = await resolveBatch(batchRaw)
        const currentYear = parseNumberValue(getVal(colIdx("currentyear", "year")), 1)
        const cgpa = parseNumberValue(getVal(colIdx("cgpa", "gpa")))
        const backlogs = parseNumberValue(getVal(colIdx("backlogs", "backlog")), 0)
        const placementStatus = parsePlacementStatus(getVal(colIdx("placementstatus", "placement")))
        const email = getVal(colIdx("email", "emailid"))
          ? String(getVal(colIdx("email", "emailid"))).trim().toLowerCase()
          : `${usnRaw.toLowerCase()}@student.gat.edu.in`
        const phone = getVal(colIdx("phone", "mobile")) ? String(getVal(colIdx("phone", "mobile"))).trim() : null
        const section = getVal(colIdx("section", "sec")) ? String(getVal(colIdx("section", "sec"))).trim().toUpperCase() : null
        const gender = getVal(colIdx("gender")) ? String(getVal(colIdx("gender"))).trim() : null
        const dateOfBirth = parseDateValue(getVal(colIdx("dateofbirth", "dob")))

        const existing = usnToStudentIdMap.get(usnRaw)

        if (existing) {
          const updated = await prisma.student.update({
            where: { id: existing },
            data: {
              name: nameRaw,
              departmentId: deptId,
              batchId,
              currentYear: currentYear ?? 1,
              cgpa,
              backlogs: backlogs ?? 0,
              placementStatus,
              section,
              gender,
              dateOfBirth,
              ...(phone ? { phone } : {}),
            },
          })
          usnToStudentIdMap.set(usnRaw, updated.id)
          studentsUpdated++
        } else {
          const created = await prisma.student.create({
            data: {
              usn: usnRaw,
              name: nameRaw,
              email,
              phone,
              departmentId: deptId,
              batchId,
              admissionYear: parseInt(batchRaw.split("-")[0]) || 2023,
              currentYear: currentYear ?? 1,
              section,
              gender,
              dateOfBirth,
              cgpa,
              backlogs: backlogs ?? 0,
              placementStatus,
              status: StudentStatus.ACTIVE,
            },
          })
          usnToStudentIdMap.set(usnRaw, created.id)
          studentsCreated++
        }
      } catch (err) {
        console.error(`Error importing student ${usnRaw}:`, err)
        failedCount++
      }
    }
  }

  // 2. Process Achievements, Certifications, Internships, Projects
  for (const [rawSheetName, rows] of Object.entries(sheets)) {
    if (!rows || rows.length < 2) continue
    const headerRow = rows[0] as string[]
    const normalizedHeaders = headerRow.map((h) => normalizeKey(String(h ?? "")))

    const colIdx = (...keys: string[]): number => {
      for (const k of keys) {
        const idx = normalizedHeaders.findIndex((h) => h.includes(k))
        if (idx !== -1) return idx
      }
      return -1
    }

    const sNameUpper = rawSheetName.toUpperCase()

    const isAchievementsSheet =
      sNameUpper.includes("ACHIEVEMENT") ||
      sNameUpper.includes("ACTIVIT") ||
      (colIdx("category") !== -1 && (colIdx("position") !== -1 || colIdx("award") !== -1 || colIdx("title") !== -1))

    const isCertificationsSheet =
      sNameUpper.includes("CERTIF") ||
      (colIdx("cert") !== -1 && colIdx("issuing") !== -1)

    const isInternshipsSheet =
      sNameUpper.includes("INTERN") ||
      (colIdx("stipend") !== -1 || (colIdx("company") !== -1 && colIdx("role") !== -1))

    const isProjectsSheet =
      sNameUpper.includes("PROJECT") ||
      (colIdx("technolog") !== -1 || colIdx("github") !== -1)

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r]
      if (!row || row.every((c) => c === "" || c === null || c === undefined)) continue
      const firstCell = String(row[0] ?? "").trim()
      if (firstCell.startsWith("[")) continue

      const getVal = (idx: number): any => (idx >= 0 && idx < row.length ? row[idx] : undefined)

      if (isAchievementsSheet) {
        const usn = String(getVal(colIdx("studentusn", "usn")) ?? "").trim().toUpperCase()
        const title = String(getVal(colIdx("achievementtitle", "title", "achievement", "event")) ?? "").trim()

        if (!usn || !title) continue
        const studentId = usnToStudentIdMap.get(usn)
        if (!studentId) {
          failedCount++
          continue
        }

        try {
          await prisma.achievement.create({
            data: {
              studentId,
              title,
              category: parseAchievementCategory(getVal(colIdx("category", "activitytype"))),
              level: parseAchievementLevel(getVal(colIdx("level"))),
              organization: getVal(colIdx("organizingbody", "organization", "org")) ? String(getVal(colIdx("organizingbody", "organization", "org"))).trim() : null,
              position: getVal(colIdx("position", "award", "rank")) ? String(getVal(colIdx("position", "award", "rank"))).trim() : null,
              achievementDate: parseDateValue(getVal(colIdx("date", "achievementdate"))),
              description: getVal(colIdx("description", "remarks")) ? String(getVal(colIdx("description", "remarks"))).trim() : null,
              verificationStatus: "VERIFIED",
              addedById: userId,
            },
          })
          achievementsCreated++
        } catch (e) {
          console.error("Error creating achievement:", e)
          failedCount++
        }
      } else if (isCertificationsSheet) {
        const usn = String(getVal(colIdx("studentusn", "usn")) ?? "").trim().toUpperCase()
        const name = String(getVal(colIdx("certificationname", "name", "title")) ?? "").trim()

        if (!usn || !name) continue
        const studentId = usnToStudentIdMap.get(usn)
        if (!studentId) {
          failedCount++
          continue
        }

        try {
          await prisma.certification.create({
            data: {
              studentId,
              name,
              issuingOrg: String(getVal(colIdx("issuingorganization", "organization", "issuingorg")) ?? "Online / Platform").trim(),
              issueDate: parseDateValue(getVal(colIdx("issuedate", "date"))),
              expiryDate: parseDateValue(getVal(colIdx("expirydate"))),
              credentialId: getVal(colIdx("credentialid")) ? String(getVal(colIdx("credentialid"))).trim() : null,
              credentialUrl: getVal(colIdx("verificationurl", "credentialurl", "url")) ? String(getVal(colIdx("verificationurl", "credentialurl", "url"))).trim() : null,
              description: getVal(colIdx("description", "remarks")) ? String(getVal(colIdx("description", "remarks"))).trim() : null,
              verificationStatus: "VERIFIED",
              addedById: userId,
            },
          })
          certificationsCreated++
        } catch (e) {
          console.error("Error creating certification:", e)
          failedCount++
        }
      } else if (isInternshipsSheet) {
        const usn = String(getVal(colIdx("studentusn", "usn")) ?? "").trim().toUpperCase()
        const company = String(getVal(colIdx("companyname", "company")) ?? "").trim()

        if (!usn || !company) continue
        const studentId = usnToStudentIdMap.get(usn)
        if (!studentId) {
          failedCount++
          continue
        }

        try {
          await prisma.internship.create({
            data: {
              studentId,
              company,
              role: String(getVal(colIdx("roledomain", "role")) ?? "Intern").trim(),
              startDate: parseDateValue(getVal(colIdx("startdate"))),
              endDate: parseDateValue(getVal(colIdx("enddate"))),
              durationWeeks: parseNumberValue(getVal(colIdx("durationweeks", "duration"))),
              location: getVal(colIdx("location")) ? String(getVal(colIdx("location"))).trim() : null,
              stipend: parseNumberValue(getVal(colIdx("monthlystipend", "stipend"))),
              internshipType: parseInternshipType(getVal(colIdx("internshiptype", "type"))),
              status: parseInternshipStatus(getVal(colIdx("status"))),
              description: getVal(colIdx("description", "deliverables")) ? String(getVal(colIdx("description", "deliverables"))).trim() : null,
              addedById: userId,
            },
          })
          internshipsCreated++
        } catch (e) {
          console.error("Error creating internship:", e)
          failedCount++
        }
      } else if (isProjectsSheet) {
        const usn = String(getVal(colIdx("studentusn", "usn")) ?? "").trim().toUpperCase()
        const title = String(getVal(colIdx("projecttitle", "title")) ?? "").trim()

        if (!usn || !title) continue
        const studentId = usnToStudentIdMap.get(usn)
        if (!studentId) {
          failedCount++
          continue
        }

        try {
          const techRaw = getVal(colIdx("technologies", "techstack")) ? String(getVal(colIdx("technologies", "techstack"))) : ""
          const techs = techRaw
            .split(/[,;|]/)
            .map((t) => t.trim())
            .filter(Boolean)

          const teamRaw = getVal(colIdx("teammembers", "team")) ? String(getVal(colIdx("teammembers", "team"))) : ""
          const teamMembers = teamRaw
            .split(/[,;|]/)
            .map((t) => t.trim().toUpperCase())
            .filter(Boolean)

          await prisma.project.create({
            data: {
              studentId,
              title,
              projectType: parseProjectType(getVal(colIdx("projecttype", "type"))),
              technologies: techs,
              facultyGuide: getVal(colIdx("facultyguide", "guide")) ? String(getVal(colIdx("facultyguide", "guide"))).trim() : null,
              teamMembers,
              githubUrl: getVal(colIdx("githuburl", "github")) ? String(getVal(colIdx("githuburl", "github"))).trim() : null,
              demoUrl: getVal(colIdx("livedemourl", "demo")) ? String(getVal(colIdx("livedemourl", "demo"))).trim() : null,
              description: getVal(colIdx("description", "summary")) ? String(getVal(colIdx("description", "summary"))).trim() : null,
              verificationStatus: "VERIFIED",
              addedById: userId,
            },
          })
          projectsCreated++
        } catch (e) {
          console.error("Error creating project:", e)
          failedCount++
        }
      }
    }
  }

  // Record Audit Log
  const totalSuccess =
    studentsCreated +
    studentsUpdated +
    achievementsCreated +
    certificationsCreated +
    internshipsCreated +
    projectsCreated

  await createAuditLog({
    userId,
    action: AuditAction.IMPORT,
    module: "bulk_import",
    recordDesc: `Excel bulk import completed: ${studentsCreated} students created, ${studentsUpdated} updated, ${achievementsCreated} achievements, ${certificationsCreated} certs, ${internshipsCreated} internships, ${projectsCreated} projects`,
  })

  return {
    success: true,
    summary: {
      studentsCreated,
      studentsUpdated,
      achievementsCreated,
      certificationsCreated,
      internshipsCreated,
      projectsCreated,
      failedCount,
    },
    errors: preview.errors,
  }
}
