import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "admin@gat.edu.in" },
    include: { department: true },
  })

  console.log("-----------------------------------------")
  console.log("✅ MongoDB Connection Successful!")
  console.log("-----------------------------------------")
  console.log("User:", user?.name, `(${user?.role})`)
  console.log("Email:", user?.email)
  const isMatch = await bcrypt.compare("Admin@123", user!.passwordHash)
  console.log("Password Valid ('Admin@123'):", isMatch)

  const studentCount = await prisma.student.count()
  console.log("Total Students in Database:", studentCount)

  const companyCount = await prisma.company.count()
  console.log("Total Companies in Database:", companyCount)

  const placementCount = await prisma.placement.count()
  console.log("Total Placements in Database:", placementCount)
  console.log("-----------------------------------------")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
