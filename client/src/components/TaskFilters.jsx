export default function TaskFilters({ filters, onChange, view, onViewChange }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center">
      <input
        type="search"
        placeholder="Search tasks…"
        className="input lg:max-w-xs"
        value={filters.search}
        onChange={set('search')}
      />
      <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
        <select className="input" value={filters.status} onChange={set('status')} disabled={view === 'board'}>
          <option value="">All statuses</option>
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <select className="input" value={filters.priority} onChange={set('priority')}>
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="input col-span-2 sm:col-span-1" value={filters.sort} onChange={set('sort')}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="dueDate">Due date</option>
          <option value="priority">Priority</option>
          <option value="title">Title (A–Z)</option>
        </select>
      </div>
      <div className="flex rounded-lg border border-slate-300 p-0.5 text-sm">
        {['list', 'board'].map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`flex-1 rounded-md px-3 py-1.5 capitalize transition ${view === v ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
