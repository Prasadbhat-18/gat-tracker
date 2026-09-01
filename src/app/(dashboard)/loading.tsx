export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-[#e2e8f0] rounded-lg" />
          <div className="h-4 w-48 bg-[#e2e8f0] rounded" />
        </div>
        <div className="flex gap-3">
          <div className="h-9 w-28 bg-[#e2e8f0] rounded-lg" />
          <div className="h-9 w-36 bg-[#e2e8f0] rounded-lg" />
        </div>
      </div>

      {/* KPI Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-[#c4c6cf] rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-[#e2e8f0] rounded" />
              <div className="h-8 w-8 bg-[#eff4ff] rounded-lg" />
            </div>
            <div className="h-7 w-20 bg-[#e2e8f0] rounded" />
            <div className="h-3 w-32 bg-[#e2e8f0] rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="bg-white border border-[#c4c6cf] rounded-xl p-6 shadow-sm space-y-4 min-h-[360px]">
        <div className="h-5 w-44 bg-[#e2e8f0] rounded" />
        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-11 w-full bg-[#f8f9ff] border border-[#eff4ff] rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
