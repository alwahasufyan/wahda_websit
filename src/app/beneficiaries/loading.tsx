export default function BeneficiariesLoading() {
  return (
    <div className="animate-pulse p-6 space-y-5">
      {/* العنوان + الأزرار */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="h-7 w-36 rounded-md bg-slate-200" />
          <div className="mt-2 h-4 w-64 rounded bg-slate-100" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 rounded-md bg-slate-200" />
          <div className="h-10 w-28 rounded-md bg-slate-200" />
          <div className="h-10 w-24 rounded-md bg-slate-200" />
          <div className="h-10 w-64 rounded-md bg-slate-100" />
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-slate-200" />
                <div className="h-7 w-14 rounded bg-slate-100" />
              </div>
              <div className="h-11 w-11 rounded-md bg-slate-100" />
            </div>
          </div>
        ))}
      </div>

      {/* تبويبات */}
      <div className="flex gap-2">
        <div className="h-9 w-28 rounded-md bg-slate-200" />
        <div className="h-9 w-28 rounded-md bg-slate-100" />
      </div>

      {/* الجدول */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        {/* رأس الجدول */}
        <div className="border-b border-slate-200 bg-slate-50 p-4">
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-3 rounded bg-slate-200" />
            ))}
          </div>
        </div>
        {/* صفوف */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-b border-slate-50 p-4">
            <div className="grid grid-cols-6 gap-4">
              <div className="h-4 rounded bg-slate-100" />
              <div className="h-4 rounded bg-slate-100" />
              <div className="h-4 w-24 rounded bg-slate-50" />
              <div className="h-4 rounded bg-slate-100" />
              <div className="h-5 w-14 rounded-md bg-slate-100" />
              <div className="flex gap-1">
                <div className="h-7 w-7 rounded bg-slate-100" />
                <div className="h-7 w-7 rounded bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
