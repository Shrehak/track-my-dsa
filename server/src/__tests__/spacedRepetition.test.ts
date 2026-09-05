import {
  calculateSM2,
  calculateUrgencyScore,
  analyzeTopicMastery,
  calculateProblemXP,
  calculateLevel,
  mapResultToQuality
} from '../algorithms/spacedRepetition';

describe('Spaced Repetition SM-2 Algorithm', () => {
  const baseDate = new Date('2026-09-01T00:00:00.000Z');

  test('schedules initial review correctly for first attempt (repetitionCount = 0)', () => {
    const result = calculateSM2(
      {
        difficulty: 'Medium',
        quality: 4,
        previousInterval: 0,
        previousEaseFactor: 2.5,
        repetitionCount: 0,
      },
      baseDate
    );

    expect(result.nextInterval).toBe(1);
    expect(result.newRepetitionCount).toBe(1);
    expect(result.status).toBe('REVIEW_DUE');
    expect(result.nextRevisionDate.getDate()).toBe(2);
  });

  test('scales interval on second successful review (repetitionCount = 1)', () => {
    const result = calculateSM2(
      {
        difficulty: 'Easy',
        quality: 5,
        previousInterval: 1,
        previousEaseFactor: 2.5,
        repetitionCount: 1,
      },
      baseDate
    );

    // 3 * 1.2 (Easy multiplier) = ~4 days
    expect(result.nextInterval).toBeGreaterThanOrEqual(3);
    expect(result.newRepetitionCount).toBe(2);
    expect(result.newEaseFactor).toBeGreaterThanOrEqual(2.5);
  });

  test('resets interval to 1 day if quality is below 3 (failure/blackout)', () => {
    const result = calculateSM2(
      {
        difficulty: 'Hard',
        quality: 2, // struggle / needed solution
        previousInterval: 14,
        previousEaseFactor: 2.4,
        repetitionCount: 3,
      },
      baseDate
    );

    expect(result.nextInterval).toBe(1);
    expect(result.newRepetitionCount).toBe(0);
    expect(result.status).toBe('LEARNING');
    expect(result.newEaseFactor).toBeLessThan(2.4);
  });

  test('never allows ease factor to drop below 1.3', () => {
    let ef = 1.4;
    for (let i = 0; i < 5; i++) {
      const res = calculateSM2({
        difficulty: 'Hard',
        quality: 1,
        previousInterval: 1,
        previousEaseFactor: ef,
        repetitionCount: 0,
      });
      ef = res.newEaseFactor;
    }
    expect(ef).toBeGreaterThanOrEqual(1.3);
  });

  test('marks problem as MASTERED after consecutive successful reviews with high quality', () => {
    const result = calculateSM2({
      difficulty: 'Medium',
      quality: 5,
      previousInterval: 15,
      previousEaseFactor: 2.6,
      repetitionCount: 3, // becomes 4
    });

    expect(result.status).toBe('MASTERED');
    expect(result.newRepetitionCount).toBe(4);
  });

  test('maps review results to correct quality values', () => {
    expect(mapResultToQuality('AGAIN')).toBe(1);
    expect(mapResultToQuality('HARD')).toBe(2);
    expect(mapResultToQuality('GOOD')).toBe(4);
    expect(mapResultToQuality('EASY')).toBe(5);
  });
});

describe('Urgency Scoring and Backlog Priority', () => {
  const now = new Date('2026-09-10T12:00:00.000Z');

  test('returns 0 urgency if problem is not overdue', () => {
    const futureDate = new Date('2026-09-12T00:00:00.000Z');
    const urgency = calculateUrgencyScore(futureDate, 3, 'Medium', now);
    expect(urgency).toBe(0);
  });

  test('produces higher urgency for overdue hard problems with low confidence', () => {
    const pastDate = new Date('2026-09-05T12:00:00.000Z'); // 5 days overdue
    const hardUrgency = calculateUrgencyScore(pastDate, 1, 'Hard', now);
    const easyUrgency = calculateUrgencyScore(pastDate, 5, 'Easy', now);

    expect(hardUrgency).toBeGreaterThan(easyUrgency);
  });
});

describe('Topic Mastery & Weak-Topic Analysis', () => {
  const now = new Date('2026-09-10T00:00:00.000Z');

  test('identifies weak topics based on low confidence and low mastery', () => {
    const mockProblems = [
      { topic: 'DP', status: 'LEARNING', confidence: 2, nextRevisionDate: new Date('2026-09-08') },
      { topic: 'DP', status: 'LEARNING', confidence: 2, nextRevisionDate: new Date('2026-09-09') },
      { topic: 'Arrays', status: 'MASTERED', confidence: 5, nextRevisionDate: new Date('2026-09-20') },
      { topic: 'Arrays', status: 'MASTERED', confidence: 4, nextRevisionDate: new Date('2026-09-25') },
    ];

    const stats = analyzeTopicMastery(mockProblems, now);
    const dpStat = stats.find(s => s.topic === 'DP');
    const arrayStat = stats.find(s => s.topic === 'Arrays');

    expect(dpStat?.isWeak).toBe(true);
    expect(dpStat?.masteryScore).toBeLessThan(50);
    expect(arrayStat?.isWeak).toBe(false);
    expect(arrayStat?.masteryScore).toBeGreaterThan(70);
  });
});

describe('Gamification (XP and Level)', () => {
  test('awards correct XP by difficulty and reviews', () => {
    expect(calculateProblemXP('Easy')).toBe(10);
    expect(calculateProblemXP('Medium')).toBe(25);
    expect(calculateProblemXP('Hard')).toBe(45);
    expect(calculateProblemXP('Hard', true)).toBe(15); // review XP
  });

  test('calculates level and progress to next level', () => {
    const stats1 = calculateLevel(85);
    expect(stats1.level).toBe(1);
    expect(stats1.progress).toBe(85);

    const stats2 = calculateLevel(250);
    expect(stats2.level).toBe(3);
    expect(stats2.currentXP).toBe(50);
    expect(stats2.progress).toBe(50);
  });
});
