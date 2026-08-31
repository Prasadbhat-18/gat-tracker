import { formatDate } from "@/lib/utils"
import { Activity } from "lucide-react"

const actionLabels: Record<string, string> = {
  CREATE: "added",
  UPDATE: "updated",
  DELETE: "deleted",
  IMPORT: "imported",
  EXPORT: "exported",
  LOGIN: "logged in",
  LOGOUT: "logged out",
  VERIFY: "verified",
  REJECT: "rejected",
}

const moduleColors: Record<string, string> = {
  students: "bg-blue-100 text-blue-700",
  achievements: "bg-amber-100 text-amber-700",
  certifications: "bg-purple-100 text-purple-700",
  internships: "bg-cyan-100 text-cyan-700",
  placements: "bg-green-100 text-green-700",
  projects: "bg-violet-100 text-violet-700",
  companies: "bg-slate-100 text-slate-700",
}

interface RecentActivityProps {
  logs: Array<{
    id: string
    action: string
    module: string
    recordDesc: string | null
    createdAt: Date
    user: { name: string }
  }>
}

export function RecentActivity({ logs }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className={`text-xs px-1.5 py-0.5 rounded font-medium ${moduleColors[log.module] ?? "bg-gray-100 text-gray-600"}`}>
                  {log.module}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700 leading-snug">
                  <span className="font-medium">{log.user.name}</span>
                  {" "}{actionLabels[log.action] ?? log.action}{" "}
                  {log.recordDesc && (
                    <span className="text-gray-500">{log.recordDesc}</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(log.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
