import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard overview
router.get('/overview', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // Get project statistics
    const projectStats = await prisma.project.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true }
    });

    // Get task statistics
    const taskStats = await prisma.task.aggregate({
      where: {
        project: { userId }
      },
      _count: {
        id: true
      }
    });

    const completedTasks = await prisma.task.count({
      where: {
        project: { userId },
        completed: true
      }
    });

    // Get recent activities
    const recentActivities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        project: {
          select: { name: true }
        }
      }
    });

    // Calculate progress
    const totalTasks = taskStats._count.id;
    const tasksPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Get active projects count
    const activeProjects = await prisma.project.count({
      where: {
        userId,
        status: 'ACTIVE'
      }
    });

    // Get pending requests (tasks with high priority)
    const pendingRequests = await prisma.task.count({
      where: {
        project: { userId },
        completed: false,
        priority: 'HIGH'
      }
    });

    const overview = {
      projectStats: projectStats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = stat._count.status;
        return acc;
      }, {} as Record<string, number>),
      totalProjects: projectStats.reduce((sum, stat) => sum + stat._count.status, 0),
      activeProjects,
      totalTasks: totalTasks,
      completedTasks,
      tasksPercentage,
      pendingRequests,
      recentActivities
    };

    res.json(overview);
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project progress data
router.get('/project-progress', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: req.user!.id,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        progress: true,
        status: true,
        priority: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json(projects);
  } catch (error) {
    console.error('Get project progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get activity timeline
router.get('/activities', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const activities = await prisma.activity.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
      include: {
        project: {
          select: { name: true }
        }
      }
    });

    const total = await prisma.activity.count({
      where: { userId: req.user!.id }
    });

    res.json({
      activities,
      total,
      hasMore: Number(offset) + Number(limit) < total
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;