import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Audit Logs" }

export default async function AuditLogsPage() {
  const session = await auth()
  if (!session) return null

  if (session.user.role !== "SUPER_ADMIN") {
    return (
      <div className="text-center py-20 text-[#44474e]">
        <p className="text-lg font-bold text-[#000a1e]">Access Restricted</p>
        <p className="text-sm mt-1">Only Super Admins can view audit logs.</p>
      </div>
    )
  }

  const logs = await prisma.auditLog.findMany({
    include: { user: { select: { name: true, role: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  const actionColors: Record<string, string> = {
    CREATE: "bg-green-100 text-green-700",
    UPDATE: "bg-blue-100 text-blue-700",
    DELETE: "bg-red-100 text-red-700",
    IMPORT: "bg-amber-100 text-amber-700",
    EXPORT: "bg-purple-100 text-purple-700",
    LOGIN: "bg-gray-100 text-gray-700",
    VERIFY: "bg-cyan-100 text-cyan-700",
    REJECT: "bg-rose-100 text-rose-700",
  }

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[#000a1e] tracking-tight mb-1">
          Audit Logs
        </h1>
        <p className="text-sm text-[#44474e] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base">security</span>
          Last {logs.length} system events
        </p>
      </div>

      <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[380px]">
        {logs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-[#f8f9ff] rounded-full flex items-center justify-center mb-4 border border-[#c4c6cf]">
              <span className="material-symbols-outlined text-[#74777f] text-3xl">history_toggle_off</span>
            </div>
            <h3 className="text-lg font-bold text-[#000a1e] mb-1">No audit events recorded</h3>
            <p className="text-sm text-[#44474e] max-w-md">
              System modifications, data exports, and administrative actions will be logged automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f8f9ff] border-b border-[#c4c6cf]">
                <tr>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Date &amp; Time
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    User
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Role
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Action
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Module
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#44474e] uppercase tracking-wider whitespace-nowrap">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff4ff]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3.5 px-4 text-xs text-[#74777f] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-[#000a1e]">{log.user.name}</td>
                    <td className="py-3.5 px-4 text-xs text-[#44474e]">{log.user.role.replace(/_/g, " ")}</td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className={`px-2 py-0.5 rounded font-medium ${actionColors[log.action] ?? "bg-gray-100 text-gray-700"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#44474e] capitalize">{log.module}</td>
                    <td className="py-3.5 px-4 text-xs text-[#0d1c2e] max-w-md">
                      <span className="line-clamp-2">{log.recordDesc ?? "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
