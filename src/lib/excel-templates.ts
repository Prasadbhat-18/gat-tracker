import ExcelJS from "exceljs"

export type TemplateType =
  | "all"
  | "students"
  | "achievements"
  | "certifications"
  | "internships"
  | "projects"

const HEADER_FILL_BLUE: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF002147" }, // GAT Primary Navy
}

const HEADER_FONT: Partial<ExcelJS.Font> = {
  name: "Segoe UI",
  size: 11,
  bold: true,
  color: { argb: "FFFFFFFF" },
}

const INSTRUCTION_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF0FDF4" }, // Soft green
}

const INSTRUCTION_FONT: Partial<ExcelJS.Font> = {
  name: "Segoe UI",
  size: 9,
  italic: true,
  color: { argb: "FF166534" },
}

function applyHeaderStyles(ws: ExcelJS.Worksheet) {
  const headerRow = ws.getRow(1)
  headerRow.height = 26
  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL_BLUE
    cell.font = HEADER_FONT
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
    cell.border = {
      top: { style: "thin", color: { argb: "FF001B3D" } },
      left: { style: "thin", color: { argb: "FF001B3D" } },
      bottom: { style: "medium", color: { argb: "FF0058BE" } },
      right: { style: "thin", color: { argb: "FF001B3D" } },
    }
  })
}

function addInstructionRow(ws: ExcelJS.Worksheet, instructions: Record<string, string>) {
  const row = ws.addRow(instructions)
  row.height = 20
  row.eachCell((cell) => {
    cell.fill = INSTRUCTION_FILL
    cell.font = INSTRUCTION_FONT
    cell.alignment = { vertical: "middle", wrapText: true }
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF86EFAC" } },
    }
  })
}

export function buildStudentsWorksheet(workbook: ExcelJS.Workbook) {
  const ws = workbook.addWorksheet("Students")
  ws.columns = [
    { header: "USN *", key: "usn", width: 18 },
    { header: "Full Name *", key: "name", width: 26 },
    { header: "Department Code *", key: "departmentCode", width: 20 },
    { header: "Batch Name *", key: "batchName", width: 16 },
    { header: "Current Year", key: "currentYear", width: 14 },
    { header: "Section", key: "section", width: 12 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "Gender", key: "gender", width: 12 },
    { header: "Date of Birth (YYYY-MM-DD)", key: "dateOfBirth", width: 24 },
    { header: "CGPA", key: "cgpa", width: 12 },
    { header: "Backlogs", key: "backlogs", width: 12 },
    { header: "Placement Status", key: "placementStatus", width: 20 },
  ]
  applyHeaderStyles(ws)

  addInstructionRow(ws, {
    usn: "[Required] e.g. 1GA21CS001",
    name: "[Required] Full Name",
    departmentCode: "[Required] e.g. CSE, ISE, ECE",
    batchName: "[Required] e.g. 2023-2027",
    currentYear: "1, 2, 3, or 4",
    section: "A, B, C",
    email: "student@gat.edu.in",
    phone: "10-digit number",
    gender: "Male / Female / Other",
    dateOfBirth: "YYYY-MM-DD",
    cgpa: "0.00 to 10.00",
    backlogs: "0, 1, 2...",
    placementStatus: "ELIGIBLE / PLACED / NOT_PLACED",
  })

  // Sample data rows
  ws.addRow({
    usn: "1GA22CS001",
    name: "Aarav Sharma",
    departmentCode: "CSE",
    batchName: "2022-2026",
    currentYear: 3,
    section: "A",
    email: "1ga22cs001@student.gat.edu.in",
    phone: "9876543210",
    gender: "Male",
    dateOfBirth: "2004-05-14",
    cgpa: 8.75,
    backlogs: 0,
    placementStatus: "ELIGIBLE",
  })

  ws.addRow({
    usn: "1GA22CS002",
    name: "Sneha Nair",
    departmentCode: "CSE",
    batchName: "2022-2026",
    currentYear: 3,
    section: "B",
    email: "1ga22cs002@student.gat.edu.in",
    phone: "9876543211",
    gender: "Female",
    dateOfBirth: "2004-08-22",
    cgpa: 9.12,
    backlogs: 0,
    placementStatus: "ELIGIBLE",
  })

  return ws
}

export function buildAchievementsWorksheet(workbook: ExcelJS.Workbook) {
  const ws = workbook.addWorksheet("Achievements")
  ws.columns = [
    { header: "Student USN *", key: "usn", width: 18 },
    { header: "Achievement Title *", key: "title", width: 34 },
    { header: "Category *", key: "category", width: 24 },
    { header: "Level", key: "level", width: 18 },
    { header: "Organizing Body / Event", key: "organization", width: 28 },
    { header: "Position / Award", key: "position", width: 20 },
    { header: "Date (YYYY-MM-DD)", key: "date", width: 20 },
    { header: "Certificate URL / Document Proof", key: "certificateUrl", width: 34 },
    { header: "Description / Remarks", key: "description", width: 34 },
  ]
  applyHeaderStyles(ws)

  addInstructionRow(ws, {
    usn: "[Required] Existing USN",
    title: "[Required] Event/Prize Name",
    category: "HACKATHON, ACADEMIC, SPORTS, CULTURAL, RESEARCH, TECHNICAL, PUBLICATION",
    level: "NATIONAL, INTERNATIONAL, STATE, UNIVERSITY, COLLEGE, DEPARTMENT",
    organization: "e.g. Smart India Hackathon / VTU",
    position: "1st Place / Winner / Runner-up",
    date: "YYYY-MM-DD",
    certificateUrl: "Google Drive, DigiLocker or Cloud Document link (optional)",
    description: "Brief summary or project details",
  })

  ws.addRow({
    usn: "1GA22CS001",
    title: "Smart India Hackathon 2024 Winner",
    category: "HACKATHON",
    level: "NATIONAL",
    organization: "Ministry of Education & AICTE",
    position: "1st Place",
    date: "2024-09-15",
    certificateUrl: "https://drive.google.com/file/d/sample-cert/view",
    description: "Built AI-powered crop disease detection platform using edge IoT sensors.",
  })

  ws.addRow({
    usn: "1GA22CS002",
    title: "IEEE Conference Best Paper Award",
    category: "PUBLICATION",
    level: "INTERNATIONAL",
    organization: "IEEE Discover 2024",
    position: "Best Paper",
    date: "2024-10-10",
    certificateUrl: "https://drive.google.com/file/d/sample-paper-cert/view",
    description: "Research paper on Optimizing Transformer Inference on Edge Devices.",
  })

  return ws
}

export function buildCertificationsWorksheet(workbook: ExcelJS.Workbook) {
  const ws = workbook.addWorksheet("Certifications")
  ws.columns = [
    { header: "Student USN *", key: "usn", width: 18 },
    { header: "Certification Name *", key: "name", width: 34 },
    { header: "Issuing Organization *", key: "issuingOrg", width: 28 },
    { header: "Issue Date (YYYY-MM-DD)", key: "issueDate", width: 22 },
    { header: "Expiry Date (YYYY-MM-DD)", key: "expiryDate", width: 22 },
    { header: "Credential ID", key: "credentialId", width: 22 },
    { header: "Verification URL", key: "credentialUrl", width: 30 },
    { header: "Certificate URL / Document Proof", key: "certificateUrl", width: 34 },
    { header: "Description", key: "description", width: 30 },
  ]
  applyHeaderStyles(ws)

  addInstructionRow(ws, {
    usn: "[Required] Student USN",
    name: "[Required] e.g. AWS Certified Developer",
    issuingOrg: "[Required] e.g. Amazon Web Services",
    issueDate: "YYYY-MM-DD",
    expiryDate: "YYYY-MM-DD (or blank)",
    credentialId: "Optional Credential ID",
    credentialUrl: "https://...",
    certificateUrl: "Certificate file or Drive URL (optional)",
    description: "Optional notes",
  })

  ws.addRow({
    usn: "1GA22CS001",
    name: "AWS Certified Solutions Architect – Associate",
    issuingOrg: "Amazon Web Services",
    issueDate: "2024-06-20",
    expiryDate: "2027-06-20",
    credentialId: "AWS-PSA-83921",
    credentialUrl: "https://aws.amazon.com/verify/AWS-PSA-83921",
    certificateUrl: "https://drive.google.com/file/d/sample-aws-cert/view",
    description: "Validated proficiency in cloud architecture and microservices design.",
  })

  return ws
}

export function buildInternshipsWorksheet(workbook: ExcelJS.Workbook) {
  const ws = workbook.addWorksheet("Internships")
  ws.columns = [
    { header: "Student USN *", key: "usn", width: 18 },
    { header: "Company Name *", key: "company", width: 26 },
    { header: "Role / Domain *", key: "role", width: 26 },
    { header: "Start Date (YYYY-MM-DD)", key: "startDate", width: 22 },
    { header: "End Date (YYYY-MM-DD)", key: "endDate", width: 22 },
    { header: "Duration (Weeks)", key: "durationWeeks", width: 18 },
    { header: "Location", key: "location", width: 18 },
    { header: "Monthly Stipend (₹)", key: "stipend", width: 20 },
    { header: "Internship Type", key: "internshipType", width: 18 },
    { header: "Status", key: "status", width: 16 },
    { header: "Description / Deliverables", key: "description", width: 34 },
  ]
  applyHeaderStyles(ws)

  addInstructionRow(ws, {
    usn: "[Required] Student USN",
    company: "[Required] e.g. Infosys / Bosch",
    role: "[Required] e.g. Software Engineer Intern",
    startDate: "YYYY-MM-DD",
    endDate: "YYYY-MM-DD",
    durationWeeks: "e.g. 8",
    location: "e.g. Bengaluru / Remote",
    stipend: "e.g. 25000",
    internshipType: "INDUSTRY, RESEARCH, STARTUP, GOVERNMENT",
    status: "COMPLETED, ONGOING, DISCONTINUED",
    description: "Key projects or technologies worked on",
  })

  ws.addRow({
    usn: "1GA22CS001",
    company: "Infosys Ltd",
    role: "Full Stack Engineer Intern",
    startDate: "2024-06-01",
    endDate: "2024-07-31",
    durationWeeks: 8,
    location: "Bengaluru",
    stipend: 20000,
    internshipType: "INDUSTRY",
    status: "COMPLETED",
    description: "Developed automated compliance check dashboards using React and Spring Boot.",
  })

  return ws
}

export function buildProjectsWorksheet(workbook: ExcelJS.Workbook) {
  const ws = workbook.addWorksheet("Projects")
  ws.columns = [
    { header: "Student USN *", key: "usn", width: 18 },
    { header: "Project Title *", key: "title", width: 32 },
    { header: "Project Type", key: "projectType", width: 20 },
    { header: "Technologies (Comma-separated)", key: "technologies", width: 32 },
    { header: "Faculty Guide Name", key: "facultyGuide", width: 24 },
    { header: "Team Members (USNs)", key: "teamMembers", width: 26 },
    { header: "GitHub URL", key: "githubUrl", width: 28 },
    { header: "Live Demo URL", key: "demoUrl", width: 28 },
    { header: "Description / Summary", key: "description", width: 34 },
  ]
  applyHeaderStyles(ws)

  addInstructionRow(ws, {
    usn: "[Required] Primary Student USN",
    title: "[Required] Project Name",
    projectType: "MINI_PROJECT, FINAL_YEAR, RESEARCH, OPEN_SOURCE, PERSONAL",
    technologies: "e.g. Next.js, Python, PostgreSQL, PyTorch",
    facultyGuide: "e.g. Dr. Ramesh Babu",
    teamMembers: "1GA22CS002, 1GA22CS003",
    githubUrl: "https://github.com/...",
    demoUrl: "https://...",
    description: "Project scope and key outcomes",
  })

  ws.addRow({
    usn: "1GA22CS001",
    title: "GAT Smart Campus Navigation & Event Platform",
    projectType: "MINI_PROJECT",
    technologies: "Next.js, TailwindCSS, MongoDB, WebSockets",
    facultyGuide: "Prof. Kavitha Nair",
    teamMembers: "1GA22CS002",
    githubUrl: "https://github.com/gat-cse/campus-navigator",
    demoUrl: "https://navigator.gat.edu.in",
    description: "Indoor pathfinding system with real-time room occupancy and tech fest schedules.",
  })

  return ws
}

export async function generateExcelTemplateBuffer(type: TemplateType): Promise<{
  buffer: ExcelJS.Buffer
  filename: string
}> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "Global Academy of Technology"
  workbook.created = new Date()

  if (type === "all") {
    buildStudentsWorksheet(workbook)
    buildAchievementsWorksheet(workbook)
    buildCertificationsWorksheet(workbook)
    buildInternshipsWorksheet(workbook)
    buildProjectsWorksheet(workbook)
    const buffer = await workbook.xlsx.writeBuffer()
    return {
      buffer,
      filename: "GAT_Master_Bulk_Upload_Template.xlsx",
    }
  }

  if (type === "students") {
    buildStudentsWorksheet(workbook)
    const buffer = await workbook.xlsx.writeBuffer()
    return { buffer, filename: "GAT_Students_Template.xlsx" }
  }

  if (type === "achievements") {
    buildAchievementsWorksheet(workbook)
    const buffer = await workbook.xlsx.writeBuffer()
    return { buffer, filename: "GAT_Achievements_Template.xlsx" }
  }

  if (type === "certifications") {
    buildCertificationsWorksheet(workbook)
    const buffer = await workbook.xlsx.writeBuffer()
    return { buffer, filename: "GAT_Certifications_Template.xlsx" }
  }

  if (type === "internships") {
    buildInternshipsWorksheet(workbook)
    const buffer = await workbook.xlsx.writeBuffer()
    return { buffer, filename: "GAT_Internships_Template.xlsx" }
  }

  if (type === "projects") {
    buildProjectsWorksheet(workbook)
    const buffer = await workbook.xlsx.writeBuffer()
    return { buffer, filename: "GAT_Projects_Template.xlsx" }
  }

  throw new Error(`Unsupported template type: ${type}`)
}
