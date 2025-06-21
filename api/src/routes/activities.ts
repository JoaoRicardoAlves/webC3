import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get user activities
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { type, limit = 50, offset = 0 } = req.query;

    const where: any = {
      userId: req.user!.id
    };

    if (type) {
      where.type = type;
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
      include: {
        project: {
          select: { name: true }
        }
      }
    });

    const total = await prisma.activity.count({ where });

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