import { beforeEach, describe, expect, test, vi } from 'vitest';
import { api } from './api';

function mockResponse(data: unknown, ok = true): Response {
  return {
    ok,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response;
}

describe('API client', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    vi.stubGlobal('fetch', vi.fn());
  });

  test('sends login credentials to the authentication endpoint', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({ data: { user: { id: '1' }, token: 'jwt-token' } })
    );

    await api.login({ email: 'user@example.com', password: 'password123' });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/auth\/login$/),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'user@example.com', password: 'password123' }),
      })
    );
  });

  test('creates a problem with the bearer token', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({ data: { problem: { id: 'problem-1' }, xpEarned: 25, userStats: {} } })
    );

    await api.createProblem({
      title: '3Sum',
      topic: 'Arrays',
      difficulty: 'Medium',
      confidence: 4,
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/problems$/),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      })
    );
  });

  test('submits a spaced-repetition review', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({ data: { problem: { id: 'problem-1' }, xpEarned: 15, userStats: {} } })
    );

    await api.reviewProblem('problem-1', { result: 'GOOD', confidence: 4 });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/problems\/problem-1\/review$/),
      expect.objectContaining({ method: 'POST' })
    );
  });

  test('surfaces backend errors to the interface', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({ error: 'Invalid email or password' }, false)
    );

    await expect(
      api.login({ email: 'user@example.com', password: 'wrong-password' })
    ).rejects.toThrow('Invalid email or password');
  });
});

