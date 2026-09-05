import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import {
  analyzeTopicMastery,
  calculateUrgencyScore,
  calculateLevel,
  Difficulty,
} from '../algorithms/spacedRepetition.js';

export async function getDashboardStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const now = new Date();

    const [user, problems, recentRevisions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true, streakCount: true, name: true },
      }),
      prisma.problem.findMany({
        where: { userId },
        select: {
          id: true,
          difficulty: true,
          status: true,
          topic: true,
          nextRevisionDate: true,
          confidence: true,
          createdAt: true,
          lastSolvedAt: true,
          title: true,
          notes: true,
        },
      }),
      prisma.revisionLog.findMany({
        where: { userId },
        orderBy: { reviewedAt: 'desc' },
        take: 7,
        include: {
          problem: {
            select: { title: true, topic: true, difficulty: true },
          },
        },
      }),
    ]);

    const totalProblems = problems.length;
    const masteredCount = problems.filter(p => p.status === 'MASTERED').length;
    const dueCount = problems.filter(p => new Date(p.nextRevisionDate).getTime() <= now.getTime()).length;
    const learningCount = problems.filter(p => p.status === 'LEARNING').length;

    // Difficulty breakdown
    const difficultyBreakdown = {
      Easy: problems.filter(p => p.difficulty === 'Easy').length,
      Medium: problems.filter(p => p.difficulty === 'Medium').length,
      Hard: problems.filter(p => p.difficulty === 'Hard').length,
    };

    // 7-day activity streak punch-card
    const weeklyActivity: Array<{ date: string; dayName: string; solved: boolean; count: number }> = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayName = dayNames[d.getDay()];

      const count = problems.filter(p => {
        const pDate = new Date(p.lastSolvedAt || p.createdAt).toISOString().slice(0, 10);
        return pDate === dateStr;
      }).length;

      weeklyActivity.push({
        date: dateStr,
        dayName,
        solved: count > 0,
        count,
      });
    }

    // Last 7 reflections (notes on problems)
    const recentReflections = problems
      .filter(p => p.notes && p.notes.trim().length > 0)
      .slice(-7)
      .reverse()
      .map(p => ({
        id: p.id,
        title: p.title,
        topic: p.topic,
        difficulty: p.difficulty,
        notes: p.notes,
        date: p.lastSolvedAt || p.createdAt,
      }));

    res.json({
      success: true,
      data: {
        user: {
          name: user?.name,
          ...calculateLevel(user?.xp || 0),
          streakCount: user?.streakCount || 0,
        },
        counts: {
          total: totalProblems,
          mastered: masteredCount,
          due: dueCount,
          learning: learningCount,
        },
        difficultyBreakdown,
        weeklyActivity,
        recentReflections,
        recentRevisions,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getWeakTopics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;

    const problems = await prisma.problem.findMany({
      where: { userId },
      select: {
        topic: true,
        status: true,
        confidence: true,
        nextRevisionDate: true,
      },
    });

    const topicStats = analyzeTopicMastery(problems);
    const weakTopics = topicStats.filter(t => t.isWeak);
    const strongTopics = topicStats.filter(t => !t.isWeak && t.masteryScore >= 70);

    res.json({
      success: true,
      data: {
        topicStats,
        weakTopics,
        strongTopics,
        recommendation:
          weakTopics.length > 0
            ? `Focus on strengthening ${weakTopics.map(w => w.topic).join(', ')} before attempting new domains.`
            : 'Excellent balance across topics! You are maintaining strong retention.',
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getRevisionBacklog(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const now = new Date();

    const dueProblems = await prisma.problem.findMany({
      where: {
        userId,
        nextRevisionDate: { lte: now },
      },
      orderBy: { nextRevisionDate: 'asc' },
    });

    const backlogWithUrgency = dueProblems.map(p => {
      const urgencyScore = calculateUrgencyScore(
        p.nextRevisionDate,
        p.confidence,
        p.difficulty as Difficulty,
        now
      );
      return {
        ...p,
        urgencyScore,
      };
    });

    // Sort descending by urgency score
    backlogWithUrgency.sort((a, b) => b.urgencyScore - a.urgencyScore);

    res.json({
      success: true,
      data: {
        totalDue: backlogWithUrgency.length,
        backlog: backlogWithUrgency,
      },
    });
  } catch (error) {
    next(error);
  }
}
