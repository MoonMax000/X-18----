/**
 * Hot Score Algorithm
 * Calculates post popularity with time decay
 * 
 * Formula: score = (engagement_score / time_penalty)
 * 
 * Engagement weights:
 * - Like: 1 point
 * - Comment: 4 points (more valuable than passive likes)
 * - Repost: 6 points (strong endorsement)
 * - View: 0.01 points (low weight, but scales with volume)
 * 
 * Time penalty: exponential decay
 * - Base: 2 hours (posts older than 2h start losing score)
 * - Gravity: 1.8 (how fast old posts fall)
 */

export interface PostMetrics {
  likes: number;
  comments: number;
  reposts: number;
  views: number;
  timestamp: string;
}

const WEIGHTS = {
  like: 1,
  comment: 4,
  repost: 6,
  view: 0.01,
} as const;

const TIME_CONFIG = {
  baseHours: 2,
  gravity: 1.8,
} as const;

/**
 * Calculate engagement score from post metrics
 */
function calculateEngagement(post: PostMetrics): number {
  return (
    post.likes * WEIGHTS.like +
    post.comments * WEIGHTS.comment +
    post.reposts * WEIGHTS.repost +
    post.views * WEIGHTS.view
  );
}

/**
 * Calculate time penalty (exponential decay)
 * Returns a number >= 1 (older posts get higher penalty)
 */
function calculateTimePenalty(timestamp: string): number {
  const now = Date.now();
  const postTime = parseTimestamp(timestamp);
  const hoursAgo = (now - postTime) / (1000 * 60 * 60);
  
  // Posts newer than base time get no penalty
  if (hoursAgo < TIME_CONFIG.baseHours) {
    return 1;
  }
  
  // Exponential decay for older posts
  const hoursBeyondBase = hoursAgo - TIME_CONFIG.baseHours;
  return Math.pow(hoursBeyondBase + 1, TIME_CONFIG.gravity);
}

/**
 * Parse various timestamp formats to milliseconds
 * Supports: "2h ago", "5m ago", "1d ago", ISO strings, unix timestamps
 */
function parseTimestamp(timestamp: string): number {
  // Handle relative time (e.g., "2h ago", "5m ago")
  const relativeMatch = timestamp.match(/^(\d+)([mhd])\s*ago$/i);
  if (relativeMatch) {
    const [, value, unit] = relativeMatch;
    const num = parseInt(value, 10);
    const now = Date.now();
    
    switch (unit.toLowerCase()) {
      case 'm': return now - num * 60 * 1000;
      case 'h': return now - num * 60 * 60 * 1000;
      case 'd': return now - num * 24 * 60 * 60 * 1000;
    }
  }
  
  // Handle ISO string or unix timestamp
  const parsed = new Date(timestamp).getTime();
  if (!isNaN(parsed)) {
    return parsed;
  }
  
  // Fallback: assume very recent
  return Date.now();
}

/**
 * Calculate hot score for a post
 * Higher score = hotter/more popular
 */
export function calculateHotScore(post: PostMetrics): number {
  const engagement = calculateEngagement(post);
  const timePenalty = calculateTimePenalty(post.timestamp);
  
  // Avoid division by zero, ensure minimum score
  const rawScore = engagement / timePenalty;
  return Math.max(rawScore, 0);
}

/**
 * Sort posts by hot score (descending)
 */
export function sortByHotScore<T extends PostMetrics>(posts: T[]): T[] {
  return [...posts].sort((a, b) => {
    const scoreA = calculateHotScore(a);
    const scoreB = calculateHotScore(b);
    return scoreB - scoreA;
  });
}
