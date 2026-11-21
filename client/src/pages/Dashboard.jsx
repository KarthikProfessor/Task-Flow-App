import { useCallback, useEffect, useState } from 'react';
import { errorMessage, tasksApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useDebounce } from '../hooks.js';
import Navbar from '../components/Navbar.jsx';
import StatsCards from '../components/StatsCards.jsx';
import TaskFilters from '../components/TaskFilters.jsx';
import TaskCard from '../components/TaskCard.jsx';
import BoardView from '../components/BoardView.jsx';
import Modal from '../components/Modal.jsx';
import TaskForm from '../components/TaskForm.jsx';
import Spinner from '../components/Spinner.jsx';

const PAGE_SIZE = 20;

export default function Dashboard() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', sort: 'newest' });
  const [view, setView] = useState(() => localStorage.getItem('taskflow_view') || 'list');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ tasks: [], pagination: { pages: 1, total: 0 } });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | task
  const [deleting, setDeleting] = useState(null);

  const search = useDebounce(filters.search);

  const load = useCallback(async () => {
    setError('');
    try {
      const params = {
        search: search || undefined,
        priority: filters.priority || undefined,
        sort: filters.sort,
        // The board shows every status, so ignore the status filter & paging there
        status: view === 'list' ? filters.status || undefined : undefined,
        page: view === 'list' ? page : 1,
        limit: view === 'list' ? PAGE_SIZE : 100,
      };
      const [list, s] = await Promise.all([tasksApi.list(params), tasksApi.stats()]);
      setData(list);
      setStats(s);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, filters.priority, filters.sort, filters.status, view, page]);

  useEffect(() => { load(); }, [load]);

  const changeFilters = (f) => { setFilters(f); setPage(1); };
  const changeView = (v) => {
    setView(v);
    setPage(1);
    try { localStorage.setItem('taskflow_view', v); } catch { /* ignore */ }
  };

  const save = async (payload) => {
    try {
      if (editing === 'new') await tasksApi.create(payload);
      else await tasksApi.update(editing._id, payload);
      setEditing(null);
      load();
    } catch (err) {
      throw new Error(errorMessage(err));
    }
  };

  const changeStatus = async (task, status) => {
    // Optimistic update for snappy UI
    setData((d) => ({ ...d, tasks: d.tasks.map((t) => (t._id === task._id ? { ...t, status } : t)) }));
    try {
      await tasksApi.update(task._id, { status });
    } catch (err) {
      setError(errorMessage(err));
    }
    load();
  };

  const confirmDelete = async () => {
    try {
      await tasksApi.remove(deleting._id);
      setDeleting(null);
      if (data.tasks.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (err) {
      setError(errorMessage(err));
      setDeleting(null);
    }
  };

  const cardProps = { onEdit: setEditing, onDelete: setDeleting, onStatusChange: changeStatus };
  const { pages, total } = data.pagination;
  const firstName = user?.name?.split(' ')[0];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Hi {firstName} 👋</h1>
            <p className="text-sm text-slate-500">Here&apos;s what&apos;s on your plate.</p>
          </div>
          <button className="btn-primary" onClick={() => setEditing('new')}>+ New task</button>
        </div>

        <StatsCards stats={stats} />
        <TaskFilters filters={filters} onChange={changeFilters} view={view} onViewChange={changeView} />

        {error && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-16 text-indigo-600"><Spinner className="h-8 w-8" /></div>
        ) : view === 'board' ? (
          <BoardView tasks={data.tasks} onDropStatus={changeStatus} {...cardProps} />
        ) : data.tasks.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white py-16 text-center">
            <p className="text-4xl">📝</p>
            <p className="mt-2 font-medium">No tasks found</p>
            <p className="text-sm text-slate-500">
              {stats?.total ? 'Try adjusting your filters.' : 'Create your first task to get started.'}
            </p>
            {!stats?.total && (
              <button className="btn-primary mt-4" onClick={() => setEditing('new')}>+ New task</button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {data.tasks.map((task) => <TaskCard key={task._id} task={task} {...cardProps} />)}
            </div>
            {pages > 1 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{total} tasks · page {page} of {pages}</span>
                <div className="flex gap-2">
                  <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
                  <button className="btn-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'New task' : 'Edit task'}>
        {editing && (
          <TaskForm
            key={editing === 'new' ? 'new' : editing._id}
            task={editing === 'new' ? null : editing}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete task?" size="max-w-sm">
        <p className="text-sm text-slate-600">
          &ldquo;<span className="font-medium text-slate-900">{deleting?.title}</span>&rdquo; will be permanently deleted.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setDeleting(null)}>Cancel</button>
          <button className="btn-danger" onClick={confirmDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
