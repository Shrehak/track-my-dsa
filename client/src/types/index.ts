export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ProblemStatus = 'LEARNING' | 'REVIEW_DUE' | 'MASTERED';
export type ReviewResult = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

export interface User {
  id: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  currentXP: number;
  nextLevelXP: number;
  progress: number;
  streakCount: number;
  createdAt: string;
}

export interface Problem {
  id: string;
  title: string;
  topic: string;
  difficulty: Difficulty;
  url?: string;
  notes?: string;
  confidence: number;
  attemptCount: number;
  firstSolvedAt: string;
  lastSolvedAt: string;
  nextRevisionDate: string;
  interval: number;
  easeFactor: number;
  repetitionCount: number;
  status: ProblemStatus;
  urgencyScore?: number;
  _count?: {
    revisions: number;
  };
}

export interface RevisionLog {
  id: string;
  problemId: string;
  reviewedAt: string;
  confidence: number;
  timeSpentMin?: number;
  result: ReviewResult;
  notes?: string;
  interval: number;
  easeFactor: number;
  problem?: {
    title: string;
    topic: string;
    difficulty: Difficulty;
  };
}

export interface TopicStat {
  topic: string;
  totalProblems: number;
  masteredCount: number;
  avgConfidence: number;
  overdueCount: number;
  masteryScore: number;
  isWeak: boolean;
}

export interface DashboardStats {
  user: {
    name: string;
    level: number;
    currentXP: number;
    nextLevelXP: number;
    progress: number;
    streakCount: number;
  };
  counts: {
    total: number;
    mastered: number;
    due: number;
    learning: number;
  };
  difficultyBreakdown: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  weeklyActivity: Array<{
    date: string;
    dayName: string;
    solved: boolean;
    count: number;
  }>;
  recentReflections: Array<{
    id: string;
    title: string;
    topic: string;
    difficulty: Difficulty;
    notes: string;
    date: string;
  }>;
  recentRevisions: RevisionLog[];
}

export interface StudyPlanTask {
  type: 'REVISION' | 'WEAK_DRILL' | 'NEW_SOLVE' | 'CHALLENGE';
  title: string;
  difficulty: string;
  topic: string;
  estimatedMinutes: number;
  targetProblemId?: string;
}

export interface StudyPlanResponse {
  planId: string;
  targetMinutes: number;
  estimatedXP: number;
  primaryWeakTopic: string;
  tasks: StudyPlanTask[];
}
