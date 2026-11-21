import mongoose from 'mongoose';
import Task, { STATUSES, PRIORITIES } from '../models/Task.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  dueDate: { dueDate: 1, createdAt: -1 },
  priority: { priorityRank: -1, createdAt: -1 },
  title: { title: 1 },
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const pick = (obj, keys) =>
  Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

const EDITABLE = ['title', 'description', 'status', 'priority', 'dueDate', 'tags'];

// GET /api/tasks?status=&priority=&search=&tag=&sort=&page=&limit=
export const getTasks = asyncHandler(async (req, res) => {
  const { status, priority, search, tag, sort = 'newest' } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);

  const match = { user: req.user._id };
  if (STATUSES.includes(status)) match.status = status;
  if (PRIORITIES.includes(priority)) match.priority = priority;
  if (tag) match.tags = String(tag).toLowerCase();
  if (search) {
    const rx = new RegExp(escapeRegex(String(search)), 'i');
    match.$or = [{ title: rx }, { description: rx }];
  }

  const [result] = await Task.aggregate([
    { $match: match },
    {
      $addFields: {
        priorityRank: {
          $indexOfArray: [PRIORITIES, '$priority'],
        },
      },
    },
    {
      $facet: {
        tasks: [
          { $sort: SORTS[sort] || SORTS.newest },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          { $project: { priorityRank: 0, __v: 0 } },
        ],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  const total = result.total[0]?.count || 0;
  res.json({
    tasks: result.tasks,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// GET /api/tasks/stats
export const getStats = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const [byStatus, overdue] = await Promise.all([
    Task.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Task.countDocuments({
      user: userId,
      status: { $ne: 'done' },
      dueDate: { $ne: null, $lt: new Date() },
    }),
  ]);

  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  byStatus.forEach(({ _id, count }) => { counts[_id] = count; });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  res.json({ total, ...counts, overdue });
});

const findOwnTask = async (id, userId) => {
  const task = await Task.findOne({ _id: id, user: userId });
  if (!task) throw new ApiError(404, 'Task not found');
  return task;
};

export const getTask = asyncHandler(async (req, res) => {
  res.json(await findOwnTask(req.params.id, req.user._id));
});

export const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({ ...pick(req.body, EDITABLE), user: req.user._id });
  res.status(201).json(task);
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await findOwnTask(req.params.id, req.user._id);
  Object.assign(task, pick(req.body, EDITABLE));
  await task.save();
  res.json(task);
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await findOwnTask(req.params.id, req.user._id);
  await task.deleteOne();
  res.json({ message: 'Task deleted', id: task._id });
});
