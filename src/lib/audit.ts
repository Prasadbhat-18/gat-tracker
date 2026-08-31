import { prisma } from "@/lib/db"
import { AuditAction } from "@prisma/client"

interface AuditOptions {
  userId: string
  action: AuditAction
  module: string
  recordId?: string
  recordDesc?: string
  oldValue?: object | string | null
  newValue?: object | string | null
  ipAddress?: string
}

export async function createAuditLog(opts: AuditOptions) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: opts.userId,
        action: opts.action,
        module: opts.module,
        recordId: opts.recordId,
        recordDesc: opts.recordDesc,
        oldValue: opts.oldValue ? JSON.stringify(opts.oldValue) : undefined,
        newValue: opts.newValue ? JSON.stringify(opts.newValue) : undefined,
        ipAddress: opts.ipAddress,
      },
    })
  } catch (error) {
    // Audit log failure should not break the main operation
    console.error("Audit log error:", error)
  }
}
