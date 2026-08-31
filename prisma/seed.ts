// GAT Tracker — Comprehensive Seed Data
// Run: npx prisma db seed

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const DEPARTMENTS = [
  { name: "Computer Science & Engineering", code: "CSE" },
  { name: "Information Science & Engineering", code: "ISE" },
  { name: "Electronics & Communication Engineering", code: "ECE" },
  { name: "Electrical & Electronics Engineering", code: "EEE" },
  { name: "Mechanical Engineering", code: "ME" },
  { name: "Civil Engineering", code: "CV" },
]

const BATCHES = [
  { name: "2021-2025", admissionYear: 2021, expectedGraduationYear: 2025 },
  { name: "2022-2026", admissionYear: 2022, expectedGraduationYear: 2026 },
  { name: "2023-2027", admissionYear: 2023, expectedGraduationYear: 2027 },
  { name: "2024-2028", admissionYear: 2024, expectedGraduationYear: 2028 },
]

const COMPANIES = [
  { name: "Infosys", industry: "IT Services", website: "https://infosys.com", location: "Bengaluru", contactName: "HR Team", contactEmail: "campus@infosys.com" },
  { name: "Wipro", industry: "IT Services", website: "https://wipro.com", location: "Bengaluru", contactName: "Talent Acquisition", contactEmail: "campus@wipro.com" },
  { name: "TCS", industry: "IT Services & Consulting", website: "https://tcs.com", location: "Mumbai", contactName: "Recruitment Team", contactEmail: "campus@tcs.com" },
  { name: "Cognizant", industry: "IT Services", website: "https://cognizant.com", location: "Chennai", contactName: "Campus HR", contactEmail: "hr@cognizant.com" },
  { name: "Accenture", industry: "Management Consulting", website: "https://accenture.com", location: "Bengaluru", contactName: "Recruitment", contactEmail: "campus@accenture.com" },
  { name: "Amazon", industry: "Technology / E-Commerce", website: "https://amazon.com", location: "Bengaluru", contactName: "University Relations", contactEmail: "university@amazon.com" },
  { name: "Microsoft", industry: "Technology", website: "https://microsoft.com", location: "Hyderabad", contactName: "Campus Team", contactEmail: "university@microsoft.com" },
  { name: "Google", industry: "Technology", website: "https://google.com", location: "Bengaluru", contactName: "University Recruiting", contactEmail: "university@google.com" },
  { name: "Capgemini", industry: "IT Services", website: "https://capgemini.com", location: "Bengaluru", contactName: "Recruitment", contactEmail: "campus@capgemini.com" },
  { name: "L&T Technology Services", industry: "Engineering & Technology", website: "https://ltts.com", location: "Vadodara", contactName: "HR", contactEmail: "hr@ltts.com" },
  { name: "Bosch", industry: "Engineering / Automotive", website: "https://bosch.com", location: "Bengaluru", contactName: "Campus Recruiter", contactEmail: "campus@bosch.com" },
  { name: "Honeywell", industry: "Industrial Automation", website: "https://honeywell.com", location: "Hyderabad", contactName: "Talent", contactEmail: "campus@honeywell.com" },
]

const STUDENT_NAMES = [
  "Rahul Kumar Sharma", "Priya Nair", "Aditya Banerjee", "Shreya Menon", "Karthik Rajan",
  "Anjali Singh", "Vikram Reddy", "Pooja Desai", "Rohan Gupta", "Sneha Pillai",
  "Arjun Verma", "Divya Krishnamurthy", "Suresh Babu M", "Lakshmi Prasad", "Amit Patel",
  "Neha Joshi", "Sanjay Kumar", "Meera Nambiar", "Deepak Rao", "Kavya Subramaniam",
  "Akhil Thomas", "Riya Chatterjee", "Manoj Hegde", "Swathi Anand", "Pramod Kumar",
  "Aishwarya Bhat", "Nikhil Gowda", "Preethi Murthy", "Ravi Shankar", "Apoorva Jain",
  "Harish Naik", "Bhavana Rao", "Vishal Sharma", "Rekha Nair", "Girish Kamath",
  "Sindhu Varghese", "Rajesh Menon", "Padma Suresh", "Santhosh Kumar", "Jyoti Singh",
  "Varun Bhat", "Ananya Iyer", "Sachin Hegde", "Nalini Rao", "Tejas Kumar",
  "Soumya Pillai", "Pavan Gowda", "Lavanya Krishnan", "Naveen Reddy", "Keerthi Nair",
]

function getUSN(deptCode: string, admissionYear: number, index: number): string {
  const yr = String(admissionYear).slice(2)
  const num = String(index).padStart(3, "0")
  return `1GA${yr}${deptCode}${num}`
}

async function main() {
  console.log("🌱 Starting GAT seed...")

  // 1. Departments
  console.log("Creating departments...")
  const deptMap: Record<string, string> = {}
  for (const dept of DEPARTMENTS) {
    const d = await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    })
    deptMap[dept.code] = d.id
  }

  // 2. Batches
  console.log("Creating batches...")
  const batchMap: Record<string, string> = {}
  for (const batch of BATCHES) {
    const b = await prisma.academicBatch.upsert({
      where: { name: batch.name },
      update: {},
      create: batch,
    })
    batchMap[batch.name] = b.id
  }

  // 3. Users
  console.log("Creating users...")
  const password = async (p: string) => bcrypt.hash(p, 12)

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@gat.edu.in" },
    update: {},
    create: {
      email: "admin@gat.edu.in",
      name: "Dr. Ramesh Babu",
      passwordHash: await password("Admin@123"),
      role: "SUPER_ADMIN",
      designation: "Principal",
      phone: "9876543210",
    },
  })

  const hodCSE = await prisma.user.upsert({
    where: { email: "hod.cse@gat.edu.in" },
    update: {},
    create: {
      email: "hod.cse@gat.edu.in",
      name: "Dr. Sunitha Rao",
      passwordHash: await password("Hod@123"),
      role: "HOD",
      departmentId: deptMap["CSE"],
      designation: "HOD - CSE",
      phone: "9876543211",
    },
  })

  const hodISE = await prisma.user.upsert({
    where: { email: "hod.ise@gat.edu.in" },
    update: {},
    create: {
      email: "hod.ise@gat.edu.in",
      name: "Dr. Prakash Hegde",
      passwordHash: await password("Hod@123"),
      role: "HOD",
      departmentId: deptMap["ISE"],
      designation: "HOD - ISE",
      phone: "9876543212",
    },
  })

  const faculty = await prisma.user.upsert({
    where: { email: "faculty@gat.edu.in" },
    update: {},
    create: {
      email: "faculty@gat.edu.in",
      name: "Prof. Kavitha Nair",
      passwordHash: await password("Faculty@123"),
      role: "FACULTY",
      departmentId: deptMap["CSE"],
      designation: "Assistant Professor",
      phone: "9876543213",
    },
  })

  const placement = await prisma.user.upsert({
    where: { email: "placement@gat.edu.in" },
    update: {},
    create: {
      email: "placement@gat.edu.in",
      name: "Mr. Suresh Menon",
      passwordHash: await password("Placement@123"),
      role: "PLACEMENT_OFFICER",
      designation: "Placement Officer",
      phone: "9876543214",
    },
  })

  console.log("✓ Users created")

  // 4. Students
  console.log("Creating students...")
  const studentIds: string[] = []
  const deptCodes = ["CSE", "ISE", "ECE", "EEE"]
  const batchNames = ["2021-2025", "2022-2026", "2023-2027", "2024-2028"]
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  let studentIndex = 0
  for (const batchName of batchNames) {
    const batch = BATCHES.find((b) => b.name === batchName)!
    const yearInProgram = Math.min(Math.max((currentMonth >= 8 ? currentYear : currentYear - 1) - batch.admissionYear + 1, 1), 4)

    for (const deptCode of deptCodes) {
      for (let i = 1; i <= 12; i++) {
        const name = STUDENT_NAMES[(studentIndex) % STUDENT_NAMES.length]
        studentIndex++
        const usn = getUSN(deptCode, batch.admissionYear, i)
        const cgpa = parseFloat((5.5 + Math.random() * 4).toFixed(2))
        const placementStatus = batchName === "2021-2025"
          ? ["PLACED", "PLACED", "PLACED", "HIGHER_STUDIES", "NOT_PLACED", "OPTED_OUT"][i % 6]
          : batchName === "2022-2026"
          ? ["ELIGIBLE", "ELIGIBLE", "APPLIED", "SHORTLISTED", "PLACED"][i % 5]
          : "ELIGIBLE"

        try {
          const student = await prisma.student.upsert({
            where: { usn },
            update: {},
            create: {
              usn,
              name,
              email: `${usn.toLowerCase()}@student.gat.edu.in`,
              phone: `98${Math.floor(10000000 + Math.random() * 89999999)}`,
              departmentId: deptMap[deptCode],
              batchId: batchMap[batchName],
              admissionYear: batch.admissionYear,
              currentYear: yearInProgram,
              cgpa,
              backlogs: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
              status: batchName === "2021-2025" && yearInProgram > 4 ? "GRADUATED" : "ACTIVE",
              placementStatus: placementStatus as any,
              section: ["A", "B", "C"][i % 3],
              gender: i % 2 === 0 ? "Female" : "Male",
            },
          })
          studentIds.push(student.id)
        } catch {
          // skip duplicates
        }
      }
    }
  }

  console.log(`✓ ${studentIds.length} students created`)

  // 5. Academic records for some students
  console.log("Creating academic records...")
  const students = await prisma.student.findMany({ take: 20, select: { id: true, currentYear: true } })
  for (const s of students) {
    const semCount = s.currentYear * 2
    let runningCgpa = 0
    for (let sem = 1; sem <= semCount; sem++) {
      const sgpa = parseFloat((5 + Math.random() * 4.5).toFixed(2))
      runningCgpa = parseFloat(((runningCgpa * (sem - 1) + sgpa) / sem).toFixed(2))
      await prisma.academicRecord.upsert({
        where: { studentId_semester: { studentId: s.id, semester: sem } },
        update: {},
        create: {
          studentId: s.id,
          semester: sem,
          academicYear: `202${Math.floor(sem / 2)}-2${Math.floor(sem / 2) + 1}`,
          sgpa,
          cgpa: runningCgpa,
          backlogs: Math.random() > 0.85 ? 1 : 0,
          activeBacklogs: 0,
        },
      })
    }
  }

  // 6. Achievements
  console.log("Creating achievements...")
  const achievementData = [
    { title: "Smart India Hackathon 2024 — Winner", category: "HACKATHON", level: "NATIONAL", org: "Ministry of Education", position: "1st Place" },
    { title: "IEEE Paper on AI in Healthcare", category: "PUBLICATION", level: "INTERNATIONAL", org: "IEEE Xplore", position: "Published" },
    { title: "Competitive Programming — CodeChef 4★", category: "CODING_COMPETITION", level: "NATIONAL", org: "CodeChef", position: "4★ Rating" },
    { title: "Best Student Award 2024", category: "ACADEMIC", level: "COLLEGE", org: "GAT", position: "1st" },
    { title: "VTU Rank Holder — 5th Semester", category: "ACADEMIC", level: "UNIVERSITY", org: "VTU", position: "Rank 3" },
    { title: "Cultural Fest — Best Director", category: "CULTURAL", level: "COLLEGE", org: "GAT Techfest", position: "Best Director" },
    { title: "NSS District Level Service Award", category: "SOCIAL_SERVICE", level: "STATE", org: "NSS Karnataka", position: "Outstanding Volunteer" },
    { title: "Research Internship Paper — NLP", category: "RESEARCH", level: "NATIONAL", org: "IISc Bengaluru", position: "Co-Author" },
    { title: "Patent Filed — IoT Water Quality Monitor", category: "PATENT", level: "NATIONAL", org: "Indian Patent Office", position: "Filed" },
    { title: "Hackathon — Blockchain for Supply Chain", category: "HACKATHON", level: "STATE", org: "TechSpark 2024", position: "Runner-up" },
  ]

  const allStudents = await prisma.student.findMany({ take: 30, select: { id: true } })
  for (let i = 0; i < Math.min(achievementData.length, allStudents.length); i++) {
    const a = achievementData[i]
    await prisma.achievement.create({
      data: {
        studentId: allStudents[i].id,
        title: a.title,
        category: a.category as any,
        level: a.level as any,
        organization: a.org,
        position: a.position,
        achievementDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(1 + Math.random() * 28)),
        verificationStatus: i % 3 === 0 ? "PENDING" : "VERIFIED",
        addedById: faculty.id,
        verifiedById: i % 3 !== 0 ? hodCSE.id : undefined,
        verifiedAt: i % 3 !== 0 ? new Date() : undefined,
      },
    })
  }

  // 7. Certifications
  console.log("Creating certifications...")
  const certData = [
    { name: "AWS Certified Solutions Architect", org: "Amazon Web Services" },
    { name: "Google Associate Cloud Engineer", org: "Google Cloud" },
    { name: "Microsoft Azure Fundamentals AZ-900", org: "Microsoft" },
    { name: "Oracle Java SE 11 Developer", org: "Oracle" },
    { name: "TCS iON National Qualifier Test", org: "TCS" },
    { name: "Coursera Deep Learning Specialization", org: "Coursera / deeplearning.ai" },
    { name: "Cisco CCNA — Network Associate", org: "Cisco" },
    { name: "Red Hat Certified System Administrator", org: "Red Hat" },
  ]

  for (let i = 0; i < Math.min(certData.length, allStudents.length); i++) {
    const c = certData[i]
    await prisma.certification.create({
      data: {
        studentId: allStudents[i].id,
        name: c.name,
        issuingOrg: c.org,
        issueDate: new Date(2024, i % 12, 15),
        expiryDate: new Date(2027, i % 12, 15),
        credentialId: `CERT-${Math.random().toString(36).toUpperCase().slice(2, 10)}`,
        verificationStatus: "VERIFIED",
        addedById: faculty.id,
      },
    })
  }

  // 8. Internships
  console.log("Creating internships...")
  const internshipData = [
    { company: "Infosys", role: "Software Engineer Intern", stipend: 15000, weeks: 8 },
    { company: "Wipro", role: "Cloud Operations Intern", stipend: 12000, weeks: 6 },
    { company: "Intel India", role: "Hardware Design Intern", stipend: 25000, weeks: 12 },
    { company: "ISRO", role: "Research Intern", stipend: 10000, weeks: 8 },
    { company: "Bosch India", role: "Embedded Systems Intern", stipend: 20000, weeks: 10 },
    { company: "Amazon", role: "SDE Intern", stipend: 50000, weeks: 8 },
    { company: "Siemens", role: "Automation Intern", stipend: 18000, weeks: 6 },
    { company: "TCS Research", role: "ML Research Intern", stipend: 15000, weeks: 8 },
  ]

  for (let i = 0; i < Math.min(internshipData.length, allStudents.length); i++) {
    const intern = internshipData[i]
    const startDate = new Date(2024, 4, 1)
    const endDate = new Date(2024, 4 + Math.ceil(intern.weeks / 4), 1)
    await prisma.internship.create({
      data: {
        studentId: allStudents[i].id,
        company: intern.company,
        role: intern.role,
        startDate,
        endDate,
        durationWeeks: intern.weeks,
        stipend: intern.stipend,
        location: ["Bengaluru", "Hyderabad", "Pune", "Chennai", "Mumbai"][i % 5],
        internshipType: "INDUSTRY",
        status: "COMPLETED",
        addedById: faculty.id,
      },
    })
  }

  // 9. Companies
  console.log("Creating companies...")
  const companyIds: string[] = []
  for (const comp of COMPANIES) {
    const c = await prisma.company.upsert({
      where: { name: comp.name },
      update: {},
      create: comp,
    })
    companyIds.push(c.id)
  }

  // 10. Placement drives
  console.log("Creating placement drives...")
  const driveIds: string[] = []
  const driveData = [
    { companyIdx: 0, driveName: "Infosys InfyTQ 2024-25", jobRole: "Systems Engineer", ctc: 3.6, eligibleDepts: ["CSE", "ISE", "ECE"] },
    { companyIdx: 1, driveName: "Wipro Elite NLTH 2024-25", jobRole: "Project Engineer", ctc: 3.5, eligibleDepts: ["CSE", "ISE", "ECE", "EEE"] },
    { companyIdx: 2, driveName: "TCS Digital 2024-25", jobRole: "Digital Specialist Engineer", ctc: 7.0, eligibleDepts: ["CSE", "ISE"] },
    { companyIdx: 4, driveName: "Accenture ASE 2024-25", jobRole: "Associate Software Engineer", ctc: 4.5, eligibleDepts: ["CSE", "ISE", "ECE"] },
    { companyIdx: 5, driveName: "Amazon SDE 2024-25", jobRole: "Software Development Engineer", ctc: 35.0, eligibleDepts: ["CSE", "ISE"] },
    { companyIdx: 6, driveName: "Microsoft SWE 2024-25", jobRole: "Software Engineer", ctc: 45.0, eligibleDepts: ["CSE", "ISE"] },
    { companyIdx: 8, driveName: "Capgemini TECH Challenge 2024", jobRole: "Analyst", ctc: 4.0, eligibleDepts: ["CSE", "ISE", "ECE", "EEE", "ME"] },
  ]

  for (const drive of driveData) {
    const d = await prisma.placementDrive.create({
      data: {
        companyId: companyIds[drive.companyIdx],
        driveName: drive.driveName,
        academicYear: "2024-25",
        driveDate: new Date(2024, 8 + (drive.companyIdx % 4), 10 + drive.companyIdx),
        jobRole: drive.jobRole,
        ctcOffered: drive.ctc,
        minCgpa: 6.0,
        maxBacklogs: 2,
        eligibleDepts: drive.eligibleDepts,
        jobLocation: "Multiple Locations",
        isActive: true,
      },
    })
    driveIds.push(d.id)
  }

  // 11. Placements
  console.log("Creating placement records...")
  const placedStudents = await prisma.student.findMany({
    where: { placementStatus: "PLACED" },
    take: 20,
    select: { id: true, departmentId: true },
  })

  const ctcOptions = [3.6, 3.5, 7.0, 4.5, 35.0, 45.0, 4.0, 5.5, 6.2, 8.5, 12.0]

  for (let i = 0; i < placedStudents.length; i++) {
    const s = placedStudents[i]
    const driveIdx = i % driveIds.length
    const ctc = ctcOptions[i % ctcOptions.length]

    await prisma.placement.create({
      data: {
        studentId: s.id,
        companyId: companyIds[driveIdx % companyIds.length],
        driveId: driveIds[driveIdx],
        jobRole: driveData[driveIdx].jobRole,
        ctc,
        location: ["Bengaluru", "Hyderabad", "Pune", "Chennai"][i % 4],
        offerDate: new Date(2024, 9 + (i % 3), 15),
        joiningDate: new Date(2025, 6, 1),
        offerStatus: "ACCEPTED",
        isFinalAccepted: true,
        addedById: placement.id,
      },
    })
  }

  // 12. Audit logs
  console.log("Creating sample audit logs...")
  const auditEntries = [
    { action: "CREATE" as const, module: "students", desc: "12 students imported from Excel" },
    { action: "UPDATE" as const, module: "placements", desc: "Rahul Kumar — Placed at Infosys ₹3.6 LPA" },
    { action: "CREATE" as const, module: "achievements", desc: "SIH Winner achievement added" },
    { action: "VERIFY" as const, module: "achievements", desc: "AWS Certification verified" },
    { action: "CREATE" as const, module: "companies", desc: "Google India added as placement partner" },
    { action: "CREATE" as const, module: "placements", desc: "Amazon drive results updated — 5 students selected" },
    { action: "UPDATE" as const, module: "students", desc: "CGPA updated for 30 students — Sem 7" },
    { action: "IMPORT" as const, module: "students", desc: "2024-2028 batch — 192 students imported" },
  ]

  for (const entry of auditEntries) {
    await prisma.auditLog.create({
      data: {
        userId: [superAdmin.id, hodCSE.id, faculty.id, placement.id][Math.floor(Math.random() * 4)],
        action: entry.action,
        module: entry.module,
        recordDesc: entry.desc,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log("✅ Seed completed successfully!")
  console.log("\n📋 Login Credentials:")
  console.log("  Super Admin:       admin@gat.edu.in / Admin@123")
  console.log("  HOD (CSE):         hod.cse@gat.edu.in / Hod@123")
  console.log("  HOD (ISE):         hod.ise@gat.edu.in / Hod@123")
  console.log("  Faculty:           faculty@gat.edu.in / Faculty@123")
  console.log("  Placement Officer: placement@gat.edu.in / Placement@123")
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
