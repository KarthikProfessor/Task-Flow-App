import TaskCard from './TaskCard.jsx';
import { STATUS } from './constants.js';

export default function BoardView({ tasks, onDropStatus, ...cardProps }) {
  const onDrop = (status) => (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const task = tasks.find((t) => t._id === id);
    if (task && task.status !== status) onDropStatus(task, status);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Object.entries(STATUS).map(([key, { label, dot }]) => {
        const items = tasks.filter((t) => t.status === key);
        return (
          <section
            key={key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop(key)}
            className="flex min-h-48 flex-col rounded-xl bg-slate-100/70 p-3"
          >
            <header className="mb-3 flex items-center gap-2 px-1">
              <span className={`h-2 w-2 rounded-full ${dot}`} />
              <h2 className="text-sm font-semibold text-slate-700">{label}</h2>
              <span className="ml-auto rounded-full bg-white px-2 text-xs text-slate-500">{items.length}</span>
            </header>
            <div className="flex flex-1 flex-col gap-2">
              {items.map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', task._id)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <TaskCard task={task} compact {...cardProps} />
                </div>
              ))}
              {!items.length && (
                <p className="rounded-lg border-2 border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">
                  Drop tasks here
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
