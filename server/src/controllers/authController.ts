import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { calculateLevel } from '../algorithms/spacedRepetition.js';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError('Email is already registered', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        xp: 0,
        level: 1,
        streakCount: 0,
      },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
        streakCount: true,
        createdAt: true,
      },
    });

    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({
      success: true,
      data: {
        user: {
          ...user,
          ...calculateLevel(user.xp),
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          xp: user.xp,
          streakCount: user.streakCount,
          ...calculateLevel(user.xp),
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function demoLogin(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const demoEmail = 'demo@trackmydsa.dev';
    let demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });

    if (!demoUser) {
      const passwordHash = await bcrypt.hash('demopassword123', 10);
      demoUser = await prisma.user.create({
        data: {
          name: 'Demo Candidate',
          email: demoEmail,
          passwordHash,
          xp: 285,
          level: 3,
          streakCount: 5,
          lastActiveDate: new Date(),
        },
      });

      // Populate rich demo problems for immediate showcase
      const sampleProblems = [
        {
          userId: demoUser.id,
          title: 'Two Sum',
          topic: 'Arrays',
          difficulty: 'Easy',
          url: 'https://leetcode.com/problems/two-sum/',
          notes: 'Classic hash map approach for complement lookup O(N) time and space.',
          confidence: 5,
          attemptCount: 3,
          interval: 14,
          easeFactor: 2.7,
          repetitionCount: 4,
          status: 'MASTERED',
          nextRevisionDate: new Date(Date.now() + 10 * 86400000),
        },
        {
          userId: demoUser.id,
          title: 'Longest Substring Without Repeating Characters',
          topic: 'Strings',
          difficulty: 'Medium',
          url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
          notes: 'Sliding window with map storing last seen index of characters.',
          confidence: 4,
          attemptCount: 2,
          interval: 6,
          easeFactor: 2.5,
          repetitionCount: 2,
          status: 'REVIEW_DUE',
          nextRevisionDate: new Date(Date.now() - 1 * 86400000), // Due today!
        },
        {
          userId: demoUser.id,
          title: 'Course Schedule (Cycle Detection)',
          topic: 'Graphs',
          difficulty: 'Medium',
          url: 'https://leetcode.com/problems/course-schedule/',
          notes: "Kahn's algorithm using in-degree array or 3-color DFS.",
          confidence: 3,
          attemptCount: 2,
          interval: 3,
          easeFactor: 2.3,
          repetitionCount: 1,
          status: 'REVIEW_DUE',
          nextRevisionDate: new Date(Date.now() - 2 * 86400000), // Overdue!
        },
        {
          userId: demoUser.id,
          title: 'Coin Change',
          topic: 'DP',
          difficulty: 'Medium',
          url: 'https://leetcode.com/problems/coin-change/',
          notes: 'Unbounded knapsack style DP array. Edge case: impossible amounts return -1.',
          confidence: 2,
          attemptCount: 1,
          interval: 1,
          easeFactor: 2.1,
          repetitionCount: 0,
          status: 'LEARNING',
          nextRevisionDate: new Date(Date.now() - 3 * 86400000), // Needs urgent review!
        },
        {
          userId: demoUser.id,
          title: 'Binary Tree Maximum Path Sum',
          topic: 'Trees',
          difficulty: 'Hard',
          url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/',
          notes: 'Post-order DFS. Track max path through root while returning max single gain to parent.',
          confidence: 3,
          attemptCount: 1,
          interval: 1,
          easeFactor: 2.2,
          repetitionCount: 0,
          status: 'LEARNING',
          nextRevisionDate: new Date(Date.now() + 1 * 86400000),
        },
        {
          userId: demoUser.id,
          title: 'Merge k Sorted Lists',
          topic: 'LinkedList',
          difficulty: 'Hard',
          url: 'https://leetcode.com/problems/merge-k-sorted-lists/',
          notes: 'Min-heap priority queue or divide-and-conquer pair merges.',
          confidence: 4,
          attemptCount: 2,
          interval: 7,
          easeFactor: 2.6,
          repetitionCount: 2,
          status: 'REVIEW_DUE',
          nextRevisionDate: new Date(Date.now() + 3 * 86400000),
        },
      ];

      for (const p of sampleProblems) {
        await prisma.problem.create({ data: p });
      }
    }

    const token = generateToken({ userId: demoUser.id, email: demoUser.email });

    res.json({
      success: true,
      data: {
        user: {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          xp: demoUser.xp,
          streakCount: demoUser.streakCount,
          ...calculateLevel(demoUser.xp),
          createdAt: demoUser.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
        streakCount: true,
        lastActiveDate: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          ...calculateLevel(user.xp),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
