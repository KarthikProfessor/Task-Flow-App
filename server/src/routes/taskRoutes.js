import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getTasks, getStats, getTask, createTask, updateTask, deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { STATUSES, PRIORITIES } from '../models/Task.js';

const router = Router();
router.use(protect);

const idRule = param('id').isMongoId().withMessage('Invalid task id');

const taskRules = (isUpdate = false) => {
  const title = body('title').trim();
  return [
    isUpdate
      ? title.optional().notEmpty().withMessage('Title cannot be empty')
      : title.notEmpty().withMessage('Title is required'),
    body('title').optional().isLength({ max: 120 }).withMessage('Title must be at most 120 characters'),
    body('description').optional().isString().isLength({ max: 2000 }),
    body('status').optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
    body('priority').optional().isIn(PRIORITIES).withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}`),
    body('dueDate').optional({ values: 'null' }).isISO8601().withMessage('Due date must be a valid date'),
    body('tags').optional().isArray({ max: 10 }).withMessage('Tags must be an array (max 10)'),
    body('tags.*').optional().isString().trim().notEmpty(),
  ];
};

router.get('/', getTasks);
router.get('/stats', getStats);
router.post('/', taskRules(), validate, createTask);
router.get('/:id', idRule, validate, getTask);
router.patch('/:id', idRule, taskRules(true), validate, updateTask);
router.put('/:id', idRule, taskRules(true), validate, updateTask);
router.delete('/:id', idRule, validate, deleteTask);

export default router;
