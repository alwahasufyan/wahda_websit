export default function DashboardLoading() {
  return (
    <div className="animate-pulse p-6 space-y-5">
      {/* العنوان */}
      <div>
        <div className="h-7 w-48 rounded-md bg-slate-200" />
        <div className="mt-2 h-4 w-32 rounded bg-slate-100" />
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-slate-200" />
                <div className="h-7 w-16 rounded bg-slate-100" />
              </div>
              <div className="h-11 w-11 rounded-lg bg-slate-100" />
            </div>
          </div>
        ))}
      </div>

      {/* عنوان نموذج الخصم */}
      <div className="h-5 w-28 rounded bg-slate-200" />

      {/* نموذج البحث */}
      <div className="rounded-lg border border-slate-200 bg-white p-2">
        <div className="flex gap-3">
          <div className="h-10 flex-1 rounded-md bg-slate-100" />
          <div className="h-10 w-28 rounded-md bg-slate-200" />
        </div>
      </div>

      {/* المستفيدون الأخيرون */}
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="mb-3 h-3 w-24 rounded bg-slate-200" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
