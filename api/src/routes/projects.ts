import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all projects for authenticated user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { status, priority, search } = req.query;
    
    const where: any = {
      userId: req.user!.id
    };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single project
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create project
router.post('/', authenticateToken, [
  body('name').trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, priority, startDate, endDate } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        priority: priority || 'MEDIUM',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId: req.user!.id
      },
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'PROJECT_CREATED',
        title: 'Project created',
        description: `Created project: ${name}`,
        userId: req.user!.id,
        projectId: project.id
      }
    });

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project
router.put('/:id', authenticateToken, [
  body('name').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('progress').optional().isInt({ min: 0, max: 100 }),
  body('status').optional().isIn(['ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, progress, status, priority, startDate, endDate } = req.body;

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(progress !== undefined && { progress }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) })
      },
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'PROJECT_UPDATED',
        title: 'Project updated',
        description: `Updated project: ${project.name}`,
        userId: req.user!.id,
        projectId: project.id
      }
    });

    // If project is completed, create completion activity
    if (status === 'COMPLETED' && existingProject.status !== 'COMPLETED') {
      await prisma.activity.create({
        data: {
          type: 'PROJECT_COMPLETED',
          title: 'Project completed',
          description: `Completed project: ${project.name}`,
          userId: req.user!.id,
          projectId: project.id
        }
      });
    }

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete project
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Check if project exists and belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await prisma.project.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;