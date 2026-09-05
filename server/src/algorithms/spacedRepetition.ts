/**
 * Spaced Repetition (SM-2 Modified) Algorithmic Engine for Track My DSA
 *
 * Implements an enhanced SuperMemo SM-2 algorithm customized for LeetCode / DSA problem-solving.
 * Features:
 * - SM-2 Easiness Factor (EF) and Interval adjustment based on review quality & problem difficulty
 * - Priority Backlog Urgency Scoring based on forgetting curve decay
 * - Algorithmic Weak-Topic Detection and Mastery Scoring
 */

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ReviewResult = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

export interface SM2Input {
  difficulty: Difficulty;
  quality: number; // 1 to 5
  previousInterval: number; // in days
  previousEaseFactor: number; // default 2.5
  repetitionCount: number; // consecutive successful reviews
}

export interface SM2Output {
  nextInterval: number; // in days
  newEaseFactor: number;
  newRepetitionCount: number;
  status: 'LEARNING' | 'REVIEW_DUE' | 'MASTERED';
  nextRevisionDate: Date;
}

/**
 * Maps human-readable review result to SM-2 quality grade (1 - 5)
 */
export function mapResultToQuality(result: ReviewResult): number {
  switch (result) {
    case 'AGAIN':
      return 1; // Complete blackout / failed to solve
    case 'HARD':
      return 2; // Solved with significant struggle/hints
    case 'GOOD':
      return 4; // Solved cleanly with minor hesitation
    case 'EASY':
      return 5; // Instant optimal solution with ease
    default:
      return 3;
  }
}

/**
 * Returns difficulty multiplier to account for cognitive load
 */
export function getDifficultyMultiplier(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'Easy':
      return 1.2; // Can safely space out faster
    case 'Medium':
      return 1.0; // Baseline
    case 'Hard':
      return 0.8; // Tricky patterns need more frequent reinforcement
    default:
      return 1.0;
  }
}

/**
 * Calculates next SM-2 interval and easiness factor
 */
export function calculateSM2(input: SM2Input, referenceDate: Date = new Date()): SM2Output {
  const { difficulty, quality, previousInterval, previousEaseFactor, repetitionCount } = input;
  const clampedQuality = Math.max(1, Math.min(5, Math.round(quality)));
  const diffMultiplier = getDifficultyMultiplier(difficulty);

  // SuperMemo formula for new Easiness Factor:
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const deltaEF = 0.1 - (5 - clampedQuality) * (0.08 + (5 - clampedQuality) * 0.02);
  const newEaseFactor = Math.max(1.3, Number((previousEaseFactor + deltaEF).toFixed(2)));

  let nextInterval: number;
  let newRepetitionCount: number;
  let status: 'LEARNING' | 'REVIEW_DUE' | 'MASTERED';

  if (clampedQuality < 3) {
    // Problem forgotten or failed: reset interval to 1 day
    nextInterval = 1;
    newRepetitionCount = 0;
    status = 'LEARNING';
  } else {
    // Successful recall
    if (repetitionCount === 0) {
      nextInterval = 1;
    } else if (repetitionCount === 1) {
      nextInterval = Math.max(2, Math.round(3 * diffMultiplier));
    } else {
      nextInterval = Math.max(
        Math.round(previousInterval * newEaseFactor * diffMultiplier),
        previousInterval + 1
      );
    }
    newRepetitionCount = repetitionCount + 1;
    status = newRepetitionCount >= 4 && clampedQuality >= 4 ? 'MASTERED' : 'REVIEW_DUE';
  }

  const nextRevisionDate = new Date(referenceDate);
  nextRevisionDate.setDate(nextRevisionDate.getDate() + nextInterval);
  // Set to start of day for consistent daily comparisons
  nextRevisionDate.setHours(0, 0, 0, 0);

  return {
    nextInterval,
    newEaseFactor,
    newRepetitionCount,
    status,
    nextRevisionDate,
  };
}

/**
 * Calculates Urgency Score for overdue problems.
 * Higher urgency means the problem is in danger of falling off the forgetting curve.
 */
export function calculateUrgencyScore(
  nextRevisionDate: Date,
  confidence: number,
  difficulty: Difficulty,
  now: Date = new Date()
): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const overdueDays = Math.max(0, (now.getTime() - nextRevisionDate.getTime()) / msPerDay);

  const diffWeight = difficulty === 'Hard' ? 1.5 : difficulty === 'Medium' ? 1.2 : 1.0;
  const confidenceFactor = Math.max(1, 6 - confidence); // lower confidence = higher urgency

  // Urgency increases with overdue days and lower confidence
  return Number((overdueDays * confidenceFactor * diffWeight).toFixed(2));
}

export interface TopicStat {
  topic: string;
  totalProblems: number;
  masteredCount: number;
  avgConfidence: number;
  overdueCount: number;
  masteryScore: number; // 0 to 100
  isWeak: boolean;
}

/**
 * Analyzes topic performance and identifies weak areas needing intervention
 */
export function analyzeTopicMastery(
  problems: Array<{
    topic: string;
    status: string;
    confidence: number;
    nextRevisionDate: Date;
  }>,
  now: Date = new Date()
): TopicStat[] {
  const groups: Record<
    string,
    { total: number; mastered: number; confidenceSum: number; overdue: number }
  > = {};

  for (const p of problems) {
    if (!groups[p.topic]) {
      groups[p.topic] = { total: 0, mastered: 0, confidenceSum: 0, overdue: 0 };
    }
    groups[p.topic].total += 1;
    if (p.status === 'MASTERED') {
      groups[p.topic].mastered += 1;
    }
    groups[p.topic].confidenceSum += p.confidence;
    if (new Date(p.nextRevisionDate).getTime() <= now.getTime()) {
      groups[p.topic].overdue += 1;
    }
  }

  const results: TopicStat[] = [];

  for (const [topic, data] of Object.entries(groups)) {
    const avgConfidence = data.total > 0 ? Number((data.confidenceSum / data.total).toFixed(1)) : 0;
    const masteredRatio = data.total > 0 ? data.mastered / data.total : 0;
    const overdueRatio = data.total > 0 ? data.overdue / data.total : 0;

    // Mastery Score Formula:
    // 50% from average confidence, 35% from mastered ratio, penalized up to 15% for overdue ratio
    const confidenceScore = (avgConfidence / 5) * 50;
    const masteredScore = masteredRatio * 35;
    const overduePenalty = overdueRatio * 15;
    const masteryScore = Math.max(0, Math.min(100, Math.round(confidenceScore + masteredScore - overduePenalty)));

    // Flag as weak topic if mastery is under 55% or avg confidence is <= 2.5
    const isWeak = data.total >= 1 && (masteryScore < 55 || avgConfidence <= 2.5);

    results.push({
      topic,
      totalProblems: data.total,
      masteredCount: data.mastered,
      avgConfidence,
      overdueCount: data.overdue,
      masteryScore,
      isWeak,
    });
  }

  return results.sort((a, b) => a.masteryScore - b.masteryScore);
}

/**
 * Calculates XP and Level progression
 * Base: Easy=10 XP, Medium=20 XP, Hard=35 XP, Review=15 XP
 */
export function calculateProblemXP(difficulty: Difficulty, isReview: boolean = false): number {
  if (isReview) return 15;
  switch (difficulty) {
    case 'Easy':
      return 10;
    case 'Medium':
      return 25;
    case 'Hard':
      return 45;
    default:
      return 10;
  }
}

export function calculateLevel(totalXP: number): { level: number; currentXP: number; nextLevelXP: number; progress: number } {
  // Level threshold: Level 1 = 0, Level 2 = 100, Level 3 = 250, Level n = n * 100
  const xpPerLevel = 100;
  const level = Math.max(1, Math.floor(totalXP / xpPerLevel) + 1);
  const currentXP = totalXP % xpPerLevel;
  const nextLevelXP = xpPerLevel;
  const progress = Math.min(100, Math.round((currentXP / nextLevelXP) * 100));

  return { level, currentXP, nextLevelXP, progress };
}
