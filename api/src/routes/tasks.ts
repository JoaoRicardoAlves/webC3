import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get tasks for a project
router.get('/project/:projectId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.projectId,
        userId: req.user!.id
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create task
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('projectId').isString(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('dueDate').optional().isISO8601()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, projectId, priority, dueDate } = req.body;

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user!.id
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'TASK_CREATED',
        title: 'Task created',
        description: `Created task: ${title}`,
        userId: req.user!.id,
        projectId
      }
    });

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update task
router.put('/:id', authenticateToken, [
  body('title').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('completed').optional().isBoolean(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('dueDate').optional().isISO8601()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, completed, priority, dueDate } = req.body;

    // Get task and verify ownership through project
    const existingTask = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        project: {
          select: { userId: true, name: true }
        }
      }
    });

    if (!existingTask || existingTask.project.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(completed !== undefined && { completed }),
        ...(priority && { priority }),
        ...(dueDate && { dueDate: new Date(dueDate) })
      }
    });

    // If task was completed, create activity log
    if (completed && !existingTask.completed) {
      await prisma.activity.create({
        data: {
          type: 'TASK_COMPLETED',
          title: 'Task completed',
          description: `Completed task: ${task.title}`,
          userId: req.user!.id,
          projectId: task.projectId
        }
      });
    }

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete task
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Get task and verify ownership through project
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        project: {
          select: { userId: true }
        }
      }
    });

    if (!task || task.project.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;