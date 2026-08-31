import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🧹 Clearing all fake/dummy tracking data...")

  // Delete all student-related dependent records
  await prisma.academicRecord.deleteMany({})
  await prisma.achievement.deleteMany({})
  await prisma.certification.deleteMany({})
  await prisma.internship.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.placement.deleteMany({})
  await prisma.placementDrive.deleteMany({})
  await prisma.company.deleteMany({})
  await prisma.higherStudy.deleteMany({})
  await prisma.document.deleteMany({})
  await prisma.notification.deleteMany({})
  await prisma.facultyStudentAssignment.deleteMany({})
  await prisma.auditLog.deleteMany({})

  // Delete all fake students
  const { count } = await prisma.student.deleteMany({})
  console.log(`✓ Removed ${count} dummy student records and all related tracking data.`)

  // Log clean start in audit
  const admin = await prisma.user.findUnique({ where: { email: "admin@gat.edu.in" } })
  if (admin) {
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "CREATE",
        module: "system",
        recordDesc: "Database cleared. System initialized for official institutional data entry.",
      },
    })
  }

  console.log("✨ Database is now completely clean and ready for real data entry!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
