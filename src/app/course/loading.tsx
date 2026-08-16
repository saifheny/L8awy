export default function CourseLoading() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 pt-6 pb-24 dir-rtl">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-200">
        <div className="h-64 animate-pulse bg-slate-300 sm:h-80" />
        <div className="space-y-4 bg-slate-100 p-6">
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-slate-300" />
          <div className="h-4 w-full animate-pulse rounded-lg bg-slate-200" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="h-20 animate-pulse rounded-2xl bg-slate-200" /><div className="h-20 animate-pulse rounded-2xl bg-slate-200" /><div className="h-20 animate-pulse rounded-2xl bg-slate-200" /><div className="h-20 animate-pulse rounded-2xl bg-slate-200" /></div>
        </div>
      </div>
    </main>
  );
}
