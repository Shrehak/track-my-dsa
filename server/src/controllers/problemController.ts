import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  calculateSM2,
  calculateProblemXP,
  calculateLevel,
  mapResultToQuality,
  Difficulty,
  ReviewResult,
} from '../algorithms/spacedRepetition.js';

export const createProblemSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Problem title is required'),
    topic: z.string().min(1, 'Topic is required'),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    url: z.string().url().optional().or(z.literal('')),
    notes: z.string().optional(),
    confidence: z.number().min(1).max(5).default(3),
  }),
});

export const updateProblemSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    topic: z.string().min(1).optional(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
    url: z.string().url().optional().or(z.literal('')),
    notes: z.string().optional(),
    confidence: z.number().min(1).max(5).optional(),
  }),
});

export const reviewProblemSchema = z.object({
  body: z.object({
    result: z.enum(['AGAIN', 'HARD', 'GOOD', 'EASY']),
    confidence: z.number().min(1).max(5),
    timeSpentMin: z.number().min(1).optional(),
    notes: z.string().optional(),
  }),
});

export async function getProblems(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const { search, topic, difficulty, status, sortBy = 'createdAt', order = 'desc' } = req.query;

    const where: any = { userId };

    if (topic && topic !== 'All') {
      where.topic = topic as string;
    }

    if (difficulty && difficulty !== 'All') {
      where.difficulty = difficulty as string;
    }

    if (status && status !== 'All') {
      if (status === 'DUE') {
        where.nextRevisionDate = { lte: new Date() };
      } else {
        where.status = status as string;
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { notes: { contains: search as string } },
      ];
    }

    const validSortFields = ['createdAt', 'nextRevisionDate', 'difficulty', 'confidence', 'title', 'interval'];
    const sortField = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const [total, problems] = await Promise.all([
      prisma.problem.count({ where }),
      prisma.problem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          _count: {
            select: { revisions: true },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        problems,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProblemById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const problem = await prisma.problem.findFirst({
      where: { id, userId },
      include: {
        revisions: {
          orderBy: { reviewedAt: 'desc' },
        },
      },
    });

    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    res.json({ success: true, data: { problem } });
  } catch (error) {
    next(error);
  }
}

export async function createProblem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { title, topic, difficulty, url, notes, confidence = 3 } = req.body;

    // Initial SM-2 schedule for first solve:
    // If user has high confidence (4-5), interval starts at 2-3 days; otherwise 1 day
    const initialInterval = confidence >= 4 ? 2 : 1;
    const nextRevisionDate = new Date();
    nextRevisionDate.setDate(nextRevisionDate.getDate() + initialInterval);
    nextRevisionDate.setHours(0, 0, 0, 0);

    const xpEarned = calculateProblemXP(difficulty as Difficulty, false);

    // Update streak logic
    const user = await prisma.user.findUnique({ where: { id: userId } });
    let newStreak = user?.streakCount || 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user?.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today.getTime() - lastActive.getTime()) / 86400000);

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1; // broken streak
      }
    } else {
      newStreak = 1;
    }

    const [problem, updatedUser] = await prisma.$transaction([
      prisma.problem.create({
        data: {
          userId,
          title,
          topic,
          difficulty,
          url: url || null,
          notes: notes || null,
          confidence,
          interval: initialInterval,
          nextRevisionDate,
          easeFactor: 2.5,
          repetitionCount: 0,
          status: 'REVIEW_DUE',
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpEarned },
          streakCount: newStreak,
          lastActiveDate: new Date(),
        },
      }),
    ]);

    res.status(201).json({
      success: true,
      data: {
        problem,
        xpEarned,
        userStats: {
          xp: updatedUser.xp,
          streakCount: updatedUser.streakCount,
          ...calculateLevel(updatedUser.xp),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProblem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    const { title, topic, difficulty, url, notes, confidence } = req.body;

    const existing = await prisma.problem.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new AppError('Problem not found', 404);
    }

    const updated = await prisma.problem.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        topic: topic !== undefined ? topic : existing.topic,
        difficulty: difficulty !== undefined ? difficulty : existing.difficulty,
        url: url !== undefined ? (url || null) : existing.url,
        notes: notes !== undefined ? notes : existing.notes,
        confidence: confidence !== undefined ? confidence : existing.confidence,
      },
    });

    res.json({ success: true, data: { problem: updated } });
  } catch (error) {
    next(error);
  }
}

export async function deleteProblem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const existing = await prisma.problem.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new AppError('Problem not found', 404);
    }

    await prisma.problem.delete({ where: { id } });

    res.json({ success: true, message: 'Problem successfully deleted' });
  } catch (error) {
    next(error);
  }
}

export async function reviewProblem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    const { result, confidence, timeSpentMin, notes } = req.body as {
      result: ReviewResult;
      confidence: number;
      timeSpentMin?: number;
      notes?: string;
    };

    const problem = await prisma.problem.findFirst({ where: { id, userId } });
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    const quality = mapResultToQuality(result);
    const sm2 = calculateSM2({
      difficulty: problem.difficulty as Difficulty,
      quality,
      previousInterval: problem.interval,
      previousEaseFactor: problem.easeFactor,
      repetitionCount: problem.repetitionCount,
    });

    const xpEarned = calculateProblemXP(problem.difficulty as Difficulty, true);

    const [updatedProblem, revisionLog, updatedUser] = await prisma.$transaction([
      prisma.problem.update({
        where: { id },
        data: {
          interval: sm2.nextInterval,
          easeFactor: sm2.newEaseFactor,
          repetitionCount: sm2.newRepetitionCount,
          status: sm2.status,
          nextRevisionDate: sm2.nextRevisionDate,
          confidence,
          lastSolvedAt: new Date(),
          attemptCount: { increment: 1 },
        },
      }),
      prisma.revisionLog.create({
        data: {
          problemId: id,
          userId,
          confidence,
          timeSpentMin: timeSpentMin || null,
          result,
          notes: notes || null,
          interval: sm2.nextInterval,
          easeFactor: sm2.newEaseFactor,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpEarned },
          lastActiveDate: new Date(),
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        problem: updatedProblem,
        revision: revisionLog,
        xpEarned,
        userStats: {
          xp: updatedUser.xp,
          streakCount: updatedUser.streakCount,
          ...calculateLevel(updatedUser.xp),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
