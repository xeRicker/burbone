
export default function Loading() {
  return (
    <div className="admin-container">
      <div className="filters animate-enter delay-1">
          <div className="filter-group">
              <h1 className="text-2xl font-bold text-white">Historia List</h1>
          </div>
      </div>
      <div className="table-card">
        <div className="p-4">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-700 rounded"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
