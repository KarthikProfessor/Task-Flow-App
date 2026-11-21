const CARDS = [
  { key: 'total', label: 'Total tasks', color: 'text-indigo-600' },
  { key: 'todo', label: 'To do', color: 'text-slate-600' },
  { key: 'in-progress', label: 'In progress', color: 'text-amber-600' },
  { key: 'done', label: 'Completed', color: 'text-emerald-600' },
  { key: 'overdue', label: 'Overdue', color: 'text-rose-600' },
];

export default function StatsCards({ stats }) {
  const pct = stats?.total ? Math.round((stats.done / stats.total) * 100) : 0;
  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CARDS.map(({ key, label, color }) => (
          <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${color}`}>{stats ? stats[key] : '–'}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium text-slate-700">Overall progress</span>
          <span className="text-slate-500">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </section>
  );
}
