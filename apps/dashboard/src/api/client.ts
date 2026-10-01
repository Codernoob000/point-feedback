import { FeedbackItem, FeedbackListResponse, AnalyticsSummary, Project } from '../types';

const API_BASE = '/api/v1';

export const api = {
  async getFeedbacks(params: {
    status?: string;
    sentiment?: string;
    priority?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<FeedbackListResponse> {
    const q = new URLSearchParams();
    if (params.status) q.append('status', params.status);
    if (params.sentiment) q.append('sentiment', params.sentiment);
    if (params.priority) q.append('priority', params.priority);
    if (params.category) q.append('category', params.category);
    if (params.search) q.append('search', params.search);
    if (params.page) q.append('page', params.page.toString());
    if (params.limit) q.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/feedback?${q.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch feedbacks: ${res.statusText}`);
    return res.json();
  },

  async getFeedback(id: string): Promise<FeedbackItem> {
    const res = await fetch(`${API_BASE}/feedback/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch feedback details: ${res.statusText}`);
    return res.json();
  },

  async updateFeedback(id: string, update: { status?: string; priority?: string; category?: string; comment?: string }): Promise<FeedbackItem> {
    const res = await fetch(`${API_BASE}/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    if (!res.ok) throw new Error(`Failed to update feedback: ${res.statusText}`);
    return res.json();
  },

  async deleteFeedback(id: string): Promise<{ status: string; id: string }> {
    const res = await fetch(`${API_BASE}/feedback/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Failed to delete feedback: ${res.statusText}`);
    return res.json();
  },

  async reanalyzeWithAI(id: string): Promise<FeedbackItem> {
    const res = await fetch(`${API_BASE}/feedback/${id}/ai-analyze`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error(`Failed to run AI triage: ${res.statusText}`);
    return res.json();
  },

  async pushToLinear(id: string): Promise<{ success: boolean; linear_issue_url: string; issue_id: string }> {
    const res = await fetch(`${API_BASE}/feedback/${id}/linear`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error(`Failed to push to Linear: ${res.statusText}`);
    return res.json();
  },

  async pushToJira(id: string): Promise<{ success: boolean; jira_issue_key: string }> {
    const res = await fetch(`${API_BASE}/feedback/${id}/jira`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error(`Failed to push to Jira: ${res.statusText}`);
    return res.json();
  },

  async getAnalytics(): Promise<AnalyticsSummary> {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error(`Failed to fetch analytics: ${res.statusText}`);
    return res.json();
  },

  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error(`Failed to fetch projects: ${res.statusText}`);
    return res.json();
  },

  async createProject(name: string, allowedOrigins: string[] = ['*']): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, allowed_origins: allowedOrigins })
    });
    if (!res.ok) throw new Error(`Failed to create project: ${res.statusText}`);
    return res.json();
  }
};
