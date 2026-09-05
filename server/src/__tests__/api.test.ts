import request from 'supertest';
import app from '../app.js';
import prisma from '../utils/prisma.js';

describe('REST API Endpoints Integration Tests', () => {
  let token: string;
  let testProblemId: string;

  beforeAll(async () => {
    // Authenticate via demo endpoint
    const res = await request(app).post('/api/auth/demo');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    token = res.body.data.token;
    expect(token).toBeDefined();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /api/health returns 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('Track My DSA API');
  });

  test('GET /api/auth/me returns current user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('demo@trackmydsa.dev');
  });

  test('GET /api/problems returns paginated problems', async () => {
    const res = await request(app)
      .get('/api/problems?limit=5&page=1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.problems)).toBe(true);
    expect(res.body.data.pagination).toBeDefined();
  });

  test('POST /api/problems creates a new problem and awards XP', async () => {
    const res = await request(app)
      .post('/api/problems')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '3Sum',
        topic: 'Arrays',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/3sum/',
        notes: 'Sort array then use two pointers with duplicate skipping.',
        confidence: 4,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.problem.title).toBe('3Sum');
    expect(res.body.data.xpEarned).toBe(25);
    testProblemId = res.body.data.problem.id;
  });

  test('POST /api/problems/:id/review submits a revision and recalculates SM-2', async () => {
    expect(testProblemId).toBeDefined();

    const res = await request(app)
      .post(`/api/problems/${testProblemId}/review`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        result: 'GOOD',
        confidence: 4,
        timeSpentMin: 15,
        notes: 'Solved smoothly using two pointers.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.revision).toBeDefined();
    expect(res.body.data.problem.repetitionCount).toBeGreaterThan(0);
    expect(res.body.data.xpEarned).toBe(15);
  });

  test('GET /api/analytics/dashboard returns rich statistics', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.counts.total).toBeGreaterThan(0);
    expect(res.body.data.weeklyActivity).toHaveLength(7);
  });

  test('GET /api/analytics/weak-topics provides diagnostic analytics', async () => {
    const res = await request(app)
      .get('/api/analytics/weak-topics')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.topicStats)).toBe(true);
  });

  test('POST /api/planner/generate produces tailored study plan', async () => {
    const res = await request(app)
      .post('/api/planner/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ targetMinutes: 45 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tasks.length).toBeGreaterThan(0);
    expect(res.body.data.estimatedXP).toBeGreaterThan(0);
  });
});
