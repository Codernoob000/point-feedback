export type Sentiment = 'angry' | 'neutral' | 'loved';
export type FeedbackStatus = 'open' | 'in_progress' | 'resolved' | 'archived';
export type FeedbackPriority = 'low' | 'medium' | 'high';
export type FeedbackCategory = 'UI Bug' | 'Performance' | 'Accessibility' | 'Feature Request' | 'Other';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ElementMetadata {
  tag: string;
  id?: string;
  classes?: string;
  selector: string;
  text?: string;
  hierarchy?: string[];
  attributes?: Record<string, string>;
}

export interface TelemetryData {
  url: string;
  viewportWidth: number;
  viewportHeight: number;
  pixelRatio: number;
  browser: string;
  userAgent: string;
  os?: string;
  language?: string;
  referrer?: string;
  timestamp?: string;
}

export interface FeedbackItem {
  id: string;
  project_id: string;
  sentiment: Sentiment;
  comment: string;
  target_selector: string;
  target_text_snippet?: string;
  bounding_box?: BoundingBox;
  dom_hierarchy?: string[];
  element_metadata?: ElementMetadata;
  page_url: string;
  viewport_width: number;
  viewport_height: number;
  user_agent?: string;
  browser?: string;
  pixel_ratio?: number;
  telemetry?: TelemetryData;
  audio_url?: string | null;
  audio_duration?: number;
  audio_transcript?: string | null;
  screenshot_url?: string | null;
  status: FeedbackStatus;
  priority?: FeedbackPriority;
  category?: FeedbackCategory;
  ai_summary?: string | null;
  linear_issue_url?: string | null;
  jira_issue_key?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  name: string;
  api_key: string;
  allowed_origins: string[];
  feedback_count?: number;
  created_at: string;
}

export interface FeedbackListResponse {
  items: FeedbackItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface AnalyticsSummary {
  total_feedback: number;
  open_count: number;
  in_progress_count: number;
  resolved_count: number;
  sentiment_breakdown: {
    angry: number;
    neutral: number;
    loved: number;
  };
  category_breakdown: Record<string, number>;
  priority_breakdown: {
    low: number;
    medium: number;
    high: number;
  };
  daily_volume: Array<{ date: string; count: number }>;
  top_pages: Array<{ url: string; count: number }>;
  most_reported_elements: Array<{ selector: string; count: number; tag: string }>;
}
