import { NEXT_STATUS, PRIORITY, STATUS } from './constants.js';

const formatDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, compact = false }) {
  const done = task.status === 'done';
  const overdue = !done && task.dueDate && new Date(task.dueDate) < new Date();
  const status = STATUS[task.status];
  const priority = PRIORITY[task.priority];

  return (
    <article className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onStatusChange(task, done ? 'todo' : 'done')}
          title={done ? 'Mark as to do' : 'Mark as done'}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs transition ${
            done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-500'
          }`}
        >
          {done && '✓'}
        </button>
        <div className="min-w-0 flex-1">
          <h3 className={`font-medium break-words ${done ? 'text-slate-400 line-through' : ''}`}>{task.title}</h3>
          {task.description && !compact && (
            <p className="mt-1 line-clamp-2 text-sm whitespace-pre-line text-slate-500">{task.description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {!compact && (
              <button
                onClick={() => onStatusChange(task, NEXT_STATUS[task.status])}
                title="Click to advance status"
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium ${status.badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </button>
            )}
            <span className={`rounded-full px-2 py-0.5 font-medium ring-1 ${priority.badge}`}>{priority.label}</span>
            {task.dueDate && (
              <span className={`rounded-full px-2 py-0.5 ${overdue ? 'bg-rose-100 font-medium text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                {overdue ? 'Overdue · ' : 'Due '}
                {formatDate(task.dueDate)}
              </span>
            )}
            {task.tags?.map((t) => (
              <span key={t} className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700">#{t}</span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
          <button onClick={() => onEdit(task)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800" title="Edit">✎</button>
          <button onClick={() => onDelete(task)} className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600" title="Delete">🗑</button>
        </div>
      </div>
    </article>
  );
}
