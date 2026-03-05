'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="admin-container">
      <div className="filters animate-enter delay-1">
        <div className="filter-group">
          <h1 className="text-2xl font-bold text-white">Historia List</h1>
        </div>
      </div>
      <div className="table-card">
        <div className="p-4 text-center">
          <h2 className="text-lg text-red-500">Wystąpił błąd</h2>
          <p className="text-sm text-gray-400 mb-4">{error.message}</p>
          <button onClick={() => reset()} className="view-btn">Spróbuj ponownie</button>
        </div>
      </div>
    </div>
  );
}
