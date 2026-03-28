export default function TransactionsLoading() {
  return (
    <div className="animate-pulse p-6 space-y-4">
      {/* العنوان */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="h-7 w-56 rounded-md bg-slate-200" />
          <div className="mt-2 h-4 w-36 rounded bg-slate-100" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 rounded-md bg-slate-200" />
          <div className="h-10 w-28 rounded-md bg-slate-200" />
          <div className="h-10 w-24 rounded-md bg-slate-200" />
        </div>
      </div>

      {/* البحث */}
      <div className="flex gap-2">
        <div className="h-10 flex-1 rounded-md bg-slate-100" />
        <div className="h-10 w-20 rounded-md bg-slate-200" />
      </div>

      {/* الفلاتر */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-16 rounded bg-slate-200" />
              <div className="h-10 rounded-md bg-slate-100" />
            </div>
          ))}
        </div>
      </div>

      {/* الجدول */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 p-4">
          <div className="grid grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-3 rounded bg-slate-200" />
            ))}
          </div>
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="border-b border-slate-50 p-4">
            <div className="grid grid-cols-8 gap-4">
              {Array.from({ length: 8 }).map((_, j) => (
                <div key={j} className="h-4 rounded bg-slate-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
