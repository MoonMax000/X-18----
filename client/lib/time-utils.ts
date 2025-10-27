// Time formatting utilities for Twitter-style timestamps

export function formatTimeAgo(timestamp: string | Date): string {
  const now = new Date();
  const then = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d`;
  }
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks}w`;
  }
  
  // For older posts, show date
  const month = then.toLocaleDateString('en-US', { month: 'short' });
  const day = then.getDate();
  const year = then.getFullYear();
  
  // Show year only if it's not current year
  if (year === now.getFullYear()) {
    return `${month} ${day}`;
  }
  
  return `${month} ${day}, ${year}`;
}

export function formatFullDate(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
