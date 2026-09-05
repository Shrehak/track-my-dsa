import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { analyzeTopicMastery, calculateUrgencyScore, Difficulty } from '../algorithms/spacedRepetition.js';

export const generatePlanSchema = z.object({
  body: z.object({
    targetMinutes: z.number().min(10, 'Target time must be at least 10 minutes').max(300, 'Max 5 hours'),
  }),
});

export async function generatePlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { targetMinutes } = req.body;
    const now = new Date();

    const [problems, dueProblems] = await Promise.all([
      prisma.problem.findMany({
        where: { userId },
        select: {
          id: true,
          topic: true,
          difficulty: true,
          status: true,
          confidence: true,
          nextRevisionDate: true,
        },
      }),
      prisma.problem.findMany({
        where: {
          userId,
          nextRevisionDate: { lte: now },
        },
        orderBy: { nextRevisionDate: 'asc' },
        take: 5,
      }),
    ]);

    const topicStats = analyzeTopicMastery(problems, now);
    const weakTopics = topicStats.filter(t => t.isWeak);
    const primaryWeakTopic = weakTopics.length > 0 ? weakTopics[0].topic : 'DP';

    // Prioritize top due problem
    const topDueProblem = dueProblems.length > 0
      ? dueProblems.map(p => ({
          ...p,
          urgencyScore: calculateUrgencyScore(p.nextRevisionDate, p.confidence, p.difficulty as Difficulty, now),
        })).sort((a, b) => b.urgencyScore - a.urgencyScore)[0]
      : null;

    // Build structured session tasks
    const tasks: Array<{
      type: 'REVISION' | 'WEAK_DRILL' | 'NEW_SOLVE' | 'CHALLENGE';
      title: string;
      difficulty: string;
      topic: string;
      estimatedMinutes: number;
      targetProblemId?: string;
    }> = [];

    let remainingMins = targetMinutes;

    if (topDueProblem && remainingMins >= 15) {
      tasks.push({
        type: 'REVISION',
        title: `Spaced Revision: ${topDueProblem.title}`,
        difficulty: topDueProblem.difficulty,
        topic: topDueProblem.topic,
        estimatedMinutes: 15,
        targetProblemId: topDueProblem.id,
      });
      remainingMins -= 15;
    }

    if (remainingMins >= 25) {
      tasks.push({
        type: 'WEAK_DRILL',
        title: `Targeted Practice: ${primaryWeakTopic} (Weak Area)`,
        difficulty: 'Medium',
        topic: primaryWeakTopic,
        estimatedMinutes: 25,
      });
      remainingMins -= 25;
    }

    if (remainingMins >= 20) {
      tasks.push({
        type: 'NEW_SOLVE',
        title: 'Fresh Concept Solve',
        difficulty: remainingMins >= 35 ? 'Hard' : 'Medium',
        topic: 'Trees',
        estimatedMinutes: remainingMins >= 35 ? 35 : 20,
      });
      remainingMins = 0;
    } else if (remainingMins >= 10) {
      tasks.push({
        type: 'NEW_SOLVE',
        title: 'Speed Warmup Problem',
        difficulty: 'Easy',
        topic: 'Arrays',
        estimatedMinutes: 10,
      });
      remainingMins = 0;
    }

    const estimatedXP = tasks.reduce((sum, t) => {
      if (t.type === 'REVISION') return sum + 15;
      if (t.difficulty === 'Hard') return sum + 45;
      if (t.difficulty === 'Medium') return sum + 25;
      return sum + 10;
    }, 25); // + 25 plan completion bonus

    const studyPlan = await prisma.studyPlan.create({
      data: {
        userId,
        targetMinutes,
        suggestedMix: JSON.stringify({
          tasks,
          primaryWeakTopic,
          estimatedXP,
        }),
      },
    });

    res.json({
      success: true,
      data: {
        planId: studyPlan.id,
        targetMinutes,
        estimatedXP,
        primaryWeakTopic,
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function completePlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const planId = req.params.planId as string;

    const plan = await prisma.studyPlan.findFirst({
      where: { id: planId, userId },
    });

    if (!plan) {
      throw new AppError('Study plan not found', 404);
    }

    if (plan.completed) {
      throw new AppError('Plan has already been marked completed', 400);
    }

    const bonusXP = 25;

    await prisma.$transaction([
      prisma.studyPlan.update({
        where: { id: planId },
        data: { completed: true },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: bonusXP } },
      }),
    ]);

    res.json({
      success: true,
      message: 'Study session completed! Bonus +25 XP awarded.',
      bonusXP,
    });
  } catch (error) {
    next(error);
  }
}
