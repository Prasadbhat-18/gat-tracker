import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      departmentId?: string
      department?: {
        id: string
        name: string
        code: string
      }
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    departmentId?: string
    department?: {
      id: string
      name: string
      code: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    departmentId?: string
    department?: {
      id: string
      name: string
      code: string
    }
  }
}
