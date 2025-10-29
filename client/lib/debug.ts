// Debug utilities for development
export const DEBUG = {
  // Enable/disable debug logging
  ENABLED: import.meta.env.MODE === 'development' || import.meta.env.VITE_DEBUG === 'true',
  
  // Debug categories
  AUTH: true,
  API: true,
  HOVER_CARDS: true,
  NOTIFICATIONS: true,
  PROFILE: true,
  FOLLOW: true,
  
  // Debug functions
  log: (category: string, message: string, data?: any) => {
    if (!DEBUG.ENABLED) return;
    
    const categoryEnabled = (DEBUG as any)[category.toUpperCase()];
    if (categoryEnabled === false) return;
    
    const timestamp = new Date().toISOString();
    const style = 'color: #00ff00; font-weight: bold;';
    
    console.log(`%c[${timestamp}] [${category}] ${message}`, style, data || '');
  },
  
  error: (category: string, message: string, error?: any) => {
    if (!DEBUG.ENABLED) return;
    
    const timestamp = new Date().toISOString();
    const style = 'color: #ff0000; font-weight: bold;';
    
    console.error(`%c[${timestamp}] [${category}] ERROR: ${message}`, style, error || '');
  },
  
  warn: (category: string, message: string, data?: any) => {
    if (!DEBUG.ENABLED) return;
    
    const timestamp = new Date().toISOString();
    const style = 'color: #ffaa00; font-weight: bold;';
    
    console.warn(`%c[${timestamp}] [${category}] WARNING: ${message}`, style, data || '');
  },
  
  table: (category: string, label: string, data: any) => {
    if (!DEBUG.ENABLED) return;
    
    const categoryEnabled = (DEBUG as any)[category.toUpperCase()];
    if (categoryEnabled === false) return;
    
    console.log(`[${category}] ${label}:`);
    console.table(data);
  }
};

// Export for global access in browser console
if (typeof window !== 'undefined') {
  (window as any).DEBUG = DEBUG;
}
