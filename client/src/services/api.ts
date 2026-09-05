import {
  User,
  Problem,
  DashboardStats,
  TopicStat,
  StudyPlanResponse,
  ReviewResult,
  Difficulty,
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Network request failed');
  }
  return data.data;
}

export const api = {
  // Auth
  register: (body: { name: string; email: string; password: string }) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  demoLogin: () =>
    request<{ user: User; token: string }>('/auth/demo', {
      method: 'POST',
    }),

  getMe: () => request<{ user: User }>('/auth/me'),

  // Problems
  getProblems: (params: {
    page?: number;
    limit?: number;
    search?: string;
    topic?: string;
    difficulty?: string;
    status?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.append(k, String(v));
    });
    return request<{
      problems: Problem[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`/problems?${query.toString()}`);
  },

  createProblem: (body: {
    title: string;
    topic: string;
    difficulty: Difficulty;
    url?: string;
    notes?: string;
    confidence: number;
  }) =>
    request<{ problem: Problem; xpEarned: number; userStats: any }>('/problems', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateProblem: (id: string, body: Partial<Problem>) =>
    request<{ problem: Problem }>(`/problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  deleteProblem: (id: string) =>
    request<{ message: string }>(`/problems/${id}`, {
      method: 'DELETE',
    }),

  reviewProblem: (
    id: string,
    body: {
      result: ReviewResult;
      confidence: number;
      timeSpentMin?: number;
      notes?: string;
    }
  ) =>
    request<{ problem: Problem; xpEarned: number; userStats: any }>(`/problems/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Analytics
  getDashboardStats: () => request<DashboardStats>('/analytics/dashboard'),

  getWeakTopics: () =>
    request<{
      topicStats: TopicStat[];
      weakTopics: TopicStat[];
      strongTopics: TopicStat[];
      recommendation: string;
    }>('/analytics/weak-topics'),

  getRevisionBacklog: () =>
    request<{
      totalDue: number;
      backlog: Problem[];
    }>('/analytics/backlog'),

  // Planner
  generatePlan: (targetMinutes: number) =>
    request<StudyPlanResponse>('/planner/generate', {
      method: 'POST',
      body: JSON.stringify({ targetMinutes }),
    }),

  completePlan: (planId: string) =>
    request<{ message: string; bonusXP: number }>(`/planner/${planId}/complete`, {
      method: 'POST',
    }),
};
