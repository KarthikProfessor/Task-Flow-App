import { useState } from 'react';
import Spinner from './Spinner.jsx';

const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function TaskForm({ task, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    dueDate: toInputDate(task?.dueDate),
    tags: task?.tags?.join(', ') || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required');
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        tags: [...new Set(form.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))],
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
      <div>
        <label className="label" htmlFor="title">Title *</label>
        <input id="title" className="input" value={form.title} onChange={set('title')} maxLength={120} autoFocus />
      </div>
      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea id="description" rows={4} className="input resize-y" value={form.description} onChange={set('description')} maxLength={2000} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="status">Status</label>
          <select id="status" className="input" value={form.status} onChange={set('status')}>
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="priority">Priority</label>
          <select id="priority" className="input" value={form.priority} onChange={set('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="dueDate">Due date</label>
          <input id="dueDate" type="date" className="input" value={form.dueDate} onChange={set('dueDate')} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="tags">Tags <span className="font-normal text-slate-400">(comma separated)</span></label>
        <input id="tags" className="input" placeholder="work, urgent" value={form.tags} onChange={set('tags')} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving && <Spinner />} {task ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  );
}
