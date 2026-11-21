export const STATUS = {
  todo: { label: 'To do', badge: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  'in-progress': { label: 'In progress', badge: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  done: { label: 'Done', badge: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
};

export const PRIORITY = {
  low: { label: 'Low', badge: 'bg-sky-50 text-sky-700 ring-sky-200' },
  medium: { label: 'Medium', badge: 'bg-violet-50 text-violet-700 ring-violet-200' },
  high: { label: 'High', badge: 'bg-rose-50 text-rose-700 ring-rose-200' },
};

export const NEXT_STATUS = { todo: 'in-progress', 'in-progress': 'done', done: 'todo' };
