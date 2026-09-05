import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const seedEmail = 'seed-demo@trackmydsa.dev';
  const passwordHash = await bcrypt.hash('demopassword123', 10);

  const existingSeedUser = await prisma.user.findUnique({ where: { email: seedEmail } });
  if (existingSeedUser) {
    await prisma.$transaction([
      prisma.revisionLog.deleteMany({ where: { userId: existingSeedUser.id } }),
      prisma.problem.deleteMany({ where: { userId: existingSeedUser.id } }),
      prisma.studyPlan.deleteMany({ where: { userId: existingSeedUser.id } }),
    ]);
  }

  const demoUser = await prisma.user.upsert({
    where: { email: seedEmail },
    create: {
      name: 'Demo Candidate',
      email: seedEmail,
      passwordHash,
      xp: 380,
      level: 4,
      streakCount: 6,
      lastActiveDate: new Date(),
    },
    update: {
      name: 'Demo Candidate',
      passwordHash,
      xp: 380,
      level: 4,
      streakCount: 6,
      lastActiveDate: new Date(),
    },
  });

  console.log(`👤 Created user: ${demoUser.email} (ID: ${demoUser.id})`);

  const now = new Date();

  // Problem 1: Two Sum (Arrays, Easy, Mastered)
  const p1 = await prisma.problem.create({
    data: {
      userId: demoUser.id,
      title: 'Two Sum',
      topic: 'Arrays',
      difficulty: 'Easy',
      url: 'https://leetcode.com/problems/two-sum/',
      notes: 'Classic hash map complement lookup. O(n) time and O(n) space.',
      confidence: 5,
      attemptCount: 3,
      interval: 16,
      easeFactor: 2.7,
      repetitionCount: 4,
      status: 'MASTERED',
      nextRevisionDate: new Date(now.getTime() + 12 * 86400000),
    },
  });

  // Problem 2: Longest Substring Without Repeating Characters (Strings, Medium, Due Today)
  const p2 = await prisma.problem.create({
    data: {
      userId: demoUser.id,
      title: 'Longest Substring Without Repeating Characters',
      topic: 'Strings',
      difficulty: 'Medium',
      url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
      notes: 'Sliding window technique with character index map. Be mindful of left pointer jumping backwards.',
      confidence: 4,
      attemptCount: 2,
      interval: 5,
      easeFactor: 2.5,
      repetitionCount: 2,
      status: 'REVIEW_DUE',
      nextRevisionDate: new Date(now.getTime() - 1 * 86400000), // Due!
    },
  });

  // Problem 3: Course Schedule (Graphs, Medium, Overdue!)
  const p3 = await prisma.problem.create({
    data: {
      userId: demoUser.id,
      title: 'Course Schedule',
      topic: 'Graphs',
      difficulty: 'Medium',
      url: 'https://leetcode.com/problems/course-schedule/',
      notes: "Topological sort cycle detection using Kahn's BFS algorithm with in-degree array.",
      confidence: 3,
      attemptCount: 2,
      interval: 3,
      easeFactor: 2.3,
      repetitionCount: 1,
      status: 'REVIEW_DUE',
      nextRevisionDate: new Date(now.getTime() - 2 * 86400000), // Overdue!
    },
  });

  // Problem 4: Coin Change (DP, Medium, Learning - Weak Area)
  const p4 = await prisma.problem.create({
    data: {
      userId: demoUser.id,
      title: 'Coin Change',
      topic: 'DP',
      difficulty: 'Medium',
      url: 'https://leetcode.com/problems/coin-change/',
      notes: 'Bottom-up 1D DP array initialized to Infinity. Watch base case dp[0] = 0.',
      confidence: 2,
      attemptCount: 1,
      interval: 1,
      easeFactor: 2.1,
      repetitionCount: 0,
      status: 'LEARNING',
      nextRevisionDate: new Date(now.getTime() - 3 * 86400000), // Overdue!
    },
  });

  // Problem 5: Lowest Common Ancestor of a Binary Tree (Trees, Medium)
  const p5 = await prisma.problem.create({
    data: {
      userId: demoUser.id,
      title: 'Lowest Common Ancestor of a Binary Tree',
      topic: 'Trees',
      difficulty: 'Medium',
      url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
      notes: 'Recursive DFS. If left and right both return non-null, root is the LCA.',
      confidence: 4,
      attemptCount: 2,
      interval: 8,
      easeFactor: 2.6,
      repetitionCount: 2,
      status: 'REVIEW_DUE',
      nextRevisionDate: new Date(now.getTime() + 4 * 86400000),
    },
  });

  // Problem 6: Trapping Rain Water (Arrays, Hard)
  const p6 = await prisma.problem.create({
    data: {
      userId: demoUser.id,
      title: 'Trapping Rain Water',
      topic: 'Arrays',
      difficulty: 'Hard',
      url: 'https://leetcode.com/problems/trapping-rain-water/',
      notes: 'Two pointer approach maintaining leftMax and rightMax. O(1) extra space.',
      confidence: 4,
      attemptCount: 2,
      interval: 7,
      easeFactor: 2.5,
      repetitionCount: 2,
      status: 'REVIEW_DUE',
      nextRevisionDate: new Date(now.getTime() + 2 * 86400000),
    },
  });

  // Create sample revision logs
  await prisma.revisionLog.create({
    data: {
      problemId: p1.id,
      userId: demoUser.id,
      reviewedAt: new Date(now.getTime() - 10 * 86400000),
      confidence: 5,
      timeSpentMin: 8,
      result: 'EASY',
      notes: 'Clean O(N) map solution implemented in under 8 mins.',
      interval: 16,
      easeFactor: 2.7,
    },
  });

  await prisma.revisionLog.create({
    data: {
      problemId: p2.id,
      userId: demoUser.id,
      reviewedAt: new Date(now.getTime() - 5 * 86400000),
      confidence: 4,
      timeSpentMin: 18,
      result: 'GOOD',
      notes: 'Recalled the sliding window condition; slight hesitation on duplicate char edge cases.',
      interval: 5,
      easeFactor: 2.5,
    },
  });

  console.log('✅ Seed completed successfully with 6 problems and 2 revision logs!');
}

main()
  .catch(e => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
